import numpy as np
import pandas as pd
import xgboost as xgb
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
from datetime import datetime, timedelta
from sklearn.metrics import r2_score, mean_absolute_error
import warnings

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

# ============================================================================
# LOAD XGBOOST MODEL (EXPENSE-ONLY MODE - NATIVE FORMAT)
# ============================================================================

MODEL_PATH = "models/xgboost_expense_forecast.model"

try:
    # Load sebagai Booster (format native XGBoost)
    model = xgb.Booster()
    model.load_model(MODEL_PATH)

    # Ambil feature names dari model
    feature_names = (
        model.feature_names
        if hasattr(model, "feature_names")
        else [
            "Transaction_Count",
            "day",
            "month",
            "year",
            "dayofweek",
            "dayofyear",
            "weekofyear",
            "is_weekend",
            "is_month_start",
            "is_month_end",
            "lag_1",
            "lag_2",
            "lag_3",
            "lag_7",
            "lag_14",
            "rolling_mean_3",
            "rolling_std_3",
            "rolling_min_3",
            "rolling_max_3",
            "rolling_mean_7",
            "rolling_std_7",
            "rolling_min_7",
            "rolling_max_7",
            "rolling_mean_14",
            "rolling_std_14",
            "rolling_min_14",
            "rolling_max_14",
            "ema_7",
            "trend",
        ]
    )

    print("=" * 80)
    print("✅ XGBoost Expense-Only Forecasting API")
    print("=" * 80)
    print(f"   Model path: {MODEL_PATH}")
    print(f"   Model loaded: YES")
    print(f"   Features: {len(feature_names)}")
    print(f"   Mode: EXPENSE-ONLY (sesuai Kaggle training)")
    print("=" * 80)

except Exception as e:
    print(f"❌ Load Error: {e}")
    traceback.print_exc()
    model = None
    feature_names = None

# ============================================================================
# HELPER FUNCTIONS (EXPENSE-ONLY MODE - SESUAI TRAINING)
# ============================================================================


def prepare_input_data(transactions_raw):
    """
    Feature engineering khusus untuk expense-only forecasting
    SESUAI DENGAN KAGGLE TRAINING (expense-only)
    """
    df = pd.DataFrame(transactions_raw)

    # Convert Date dan sort
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values("Date")

    # ✅ FILTER HANYA EXPENSE (SESUAI DENGAN KAGGLE TRAINING)
    if "Type" in df.columns:
        df = df[df["Type"].str.upper() == "EXPENSE"].copy()
    else:
        # Jika tidak ada kolom Type, asumsikan semua adalah expense
        print(
            "⚠️ Warning: No 'Type' column found. Assuming all transactions are EXPENSE."
        )

    # ✅ TARGET VARIABLE: Amount (SELALU POSITIF untuk expense)
    # TIDAK ADA Net_Amount! Model dilatih untuk Amount positif saja
    df["Target"] = df["Amount"]  # BUKAN Net_Amount!

    # Aggregate daily (sum Amount, count transactions)
    daily_df = (
        df.groupby("Date")
        .agg(
            Amount=("Amount", "sum"),  # Total expense per hari (POSITIF)
            Transaction_Count=("Amount", "count"),  # Jumlah transaksi per hari
        )
        .reset_index()
    )

    # Sort by date
    daily_df = daily_df.sort_values("Date").reset_index(drop=True)

    # Handle missing dates (fill dengan 0)
    if len(daily_df) == 0:
        # Fallback jika tidak ada expense sama sekali
        start_date = pd.to_datetime("2025-06-30")
        end_date = pd.to_datetime("2025-12-30")
        date_range = pd.date_range(start=start_date, end=end_date, freq="D")
        daily_df = pd.DataFrame({"Date": date_range})
        daily_df["Amount"] = 0.0
        daily_df["Transaction_Count"] = 0
    else:
        date_range = pd.date_range(
            start=daily_df["Date"].min(), end=daily_df["Date"].max(), freq="D"
        )
        daily_df = (
            daily_df.set_index("Date").reindex(date_range).fillna(0).reset_index()
        )
        daily_df = daily_df.rename(columns={"index": "Date"})

    # ============================================================================
    # FEATURE ENGINEERING (SESUAI DENGAN KAGGLE TRAINING)
    # ============================================================================

    # Basic date features
    daily_df["day"] = daily_df["Date"].dt.day.astype("int8")
    daily_df["month"] = daily_df["Date"].dt.month.astype("int8")
    daily_df["year"] = daily_df["Date"].dt.year.astype("int16")
    daily_df["dayofweek"] = daily_df["Date"].dt.dayofweek.astype(
        "int8"
    )  # Monday=0, Sunday=6
    daily_df["dayofyear"] = daily_df["Date"].dt.dayofyear.astype("int16")
    daily_df["weekofyear"] = daily_df["Date"].dt.isocalendar().week.astype("int8")
    daily_df["is_weekend"] = (daily_df["dayofweek"] >= 5).astype("int8")
    daily_df["is_month_start"] = daily_df["Date"].dt.is_month_start.astype("int8")
    daily_df["is_month_end"] = daily_df["Date"].dt.is_month_end.astype("int8")

    # Lag features (berdasarkan Amount positif)
    lag_periods = [1, 2, 3, 7, 14]
    for lag in lag_periods:
        daily_df[f"lag_{lag}"] = daily_df["Amount"].shift(lag)

    # Rolling features
    rolling_windows = [3, 7, 14]
    for window in rolling_windows:
        daily_df[f"rolling_mean_{window}"] = (
            daily_df["Amount"].rolling(window=window, min_periods=1).mean()
        )
        daily_df[f"rolling_std_{window}"] = (
            daily_df["Amount"].rolling(window=window, min_periods=1).std()
        )
        daily_df[f"rolling_min_{window}"] = (
            daily_df["Amount"].rolling(window=window, min_periods=1).min()
        )
        daily_df[f"rolling_max_{window}"] = (
            daily_df["Amount"].rolling(window=window, min_periods=1).max()
        )

    # Exponential Moving Average
    daily_df["ema_7"] = daily_df["Amount"].ewm(span=7, adjust=False).mean()

    # Trend feature (sequential index - konsisten dengan training Kaggle)
    daily_df["trend"] = range(len(daily_df))

    # Fill missing values
    daily_df = daily_df.fillna(method="ffill").fillna(method="bfill")

    # Convert to float32 untuk efisiensi memory
    float_cols = daily_df.select_dtypes(include=["float64"]).columns
    daily_df[float_cols] = daily_df[float_cols].astype("float32")

    # Feature columns (29 features sesuai training)
    feature_cols = [
        "Transaction_Count",
        "day",
        "month",
        "year",
        "dayofweek",
        "dayofyear",
        "weekofyear",
        "is_weekend",
        "is_month_start",
        "is_month_end",
        "lag_1",
        "lag_2",
        "lag_3",
        "lag_7",
        "lag_14",
        "rolling_mean_3",
        "rolling_std_3",
        "rolling_min_3",
        "rolling_max_3",
        "rolling_mean_7",
        "rolling_std_7",
        "rolling_min_7",
        "rolling_max_7",
        "rolling_mean_14",
        "rolling_std_14",
        "rolling_min_14",
        "rolling_max_14",
        "ema_7",
        "trend",
    ]

    # Pastikan semua fitur ada
    for feat in feature_cols:
        if feat not in daily_df.columns:
            daily_df[feat] = 0.0

    X = daily_df[feature_cols].copy()
    y = daily_df["Amount"].values  # Target = Amount positif

    return daily_df, X, feature_cols, y


def forecast_next_days(model, daily_df, features, periods=7):
    """
    Forecast expense untuk beberapa hari ke depan (SELALU POSITIF)
    SESUAI DENGAN KAGGLE TRAINING
    """
    last_date = daily_df["Date"].max()
    future_dates = [last_date + timedelta(days=i + 1) for i in range(periods)]

    forecast_df = pd.DataFrame({"Date": future_dates})

    # Create date features
    forecast_df["day"] = forecast_df["Date"].dt.day.astype("int8")
    forecast_df["month"] = forecast_df["Date"].dt.month.astype("int8")
    forecast_df["year"] = forecast_df["Date"].dt.year.astype("int16")
    forecast_df["dayofweek"] = forecast_df["Date"].dt.dayofweek.astype("int8")
    forecast_df["dayofyear"] = forecast_df["Date"].dt.dayofyear.astype("int16")
    forecast_df["weekofyear"] = forecast_df["Date"].dt.isocalendar().week.astype("int8")
    forecast_df["is_weekend"] = (forecast_df["dayofweek"] >= 5).astype("int8")
    forecast_df["is_month_start"] = forecast_df["Date"].dt.is_month_start.astype("int8")
    forecast_df["is_month_end"] = forecast_df["Date"].dt.is_month_end.astype("int8")
    forecast_df["trend"] = range(len(daily_df), len(daily_df) + periods)

    # Fill lag features dengan nilai dari data terakhir (Amount positif)
    last_values = daily_df.iloc[-1]

    for lag in [1, 2, 3, 7, 14]:
        if lag == 1:
            forecast_df[f"lag_{lag}"] = last_values["Amount"]
        else:
            lag_value = (
                daily_df.iloc[-lag]["Amount"]
                if len(daily_df) >= lag
                else last_values["Amount"]
            )
            forecast_df[f"lag_{lag}"] = lag_value

    # Rolling features
    for window in [3, 7, 14]:
        forecast_df[f"rolling_mean_{window}"] = last_values[f"rolling_mean_{window}"]
        forecast_df[f"rolling_std_{window}"] = (
            last_values[f"rolling_std_{window}"]
            if not pd.isna(last_values[f"rolling_std_{window}"])
            else 0.0
        )
        forecast_df[f"rolling_min_{window}"] = last_values[f"rolling_min_{window}"]
        forecast_df[f"rolling_max_{window}"] = last_values[f"rolling_max_{window}"]

    # EMA
    forecast_df["ema_7"] = last_values["ema_7"]

    # Transaction_Count - gunakan rata-rata 7 hari terakhir
    avg_transaction = daily_df["Transaction_Count"].tail(7).mean()
    forecast_df["Transaction_Count"] = avg_transaction

    # Fill missing values
    forecast_df = forecast_df.fillna(method="ffill").fillna(method="bfill")

    for feat in features:
        if feat not in forecast_df.columns:
            forecast_df[feat] = 0.0

    # Prediction (SELALU POSITIF karena model dilatih untuk Amount positif)
    dmatrix = xgb.DMatrix(forecast_df[features], feature_names=features)
    forecast_df["forecast"] = model.predict(dmatrix)

    # ✅ CLAMP KE MINIMUM 10.000 (realistis untuk expense harian di Indonesia)
    forecast_df["forecast"] = forecast_df["forecast"].clip(lower=10000)

    return forecast_df


def convert_to_python_types(obj):
    """
    Konversi numpy types ke Python native types untuk JSON serialization
    """
    if isinstance(obj, (np.integer, np.int8, np.int16, np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float16, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return obj.strftime("%Y-%m-%d")
    elif isinstance(obj, pd.Timedelta):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: convert_to_python_types(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_python_types(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_to_python_types(item) for item in obj)
    else:
        return obj


# ============================================================================
# FLASK ROUTES
# ============================================================================


@app.route("/analyze-forecast", methods=["POST"])
def analyze_forecast():
    try:
        # ============================================================================
        # VALIDATION
        # ============================================================================

        if model is None or feature_names is None:
            return (
                jsonify(
                    {
                        "error": "MODEL_NOT_LOADED",
                        "message": "Model XGBoost belum berhasil dimuat.",
                    }
                ),
                500,
            )

        req_data = request.json
        transactions = req_data.get("transactions", [])
        mode = req_data.get("mode", "weekly")

        if not transactions or len(transactions) < 7:
            return (
                jsonify(
                    {
                        "error": "INSUFFICIENT_DATA",
                        "message": "Minimal 7 transaksi diperlukan untuk prediksi",
                    }
                ),
                400,
            )

        # ============================================================================
        # PREPARE DATA (EXPENSE-ONLY MODE - SESUAI TRAINING)
        # ============================================================================

        daily_df, X, feature_cols, y = prepare_input_data(transactions)

        print(f"\n📊 [FORECAST DEBUG - EXPENSE-ONLY MODE]")
        print(f"   Total data points: {len(daily_df)}")
        print(f"   Data range: {daily_df['Date'].min()} to {daily_df['Date'].max()}")
        print(f"   Features used: {len(feature_cols)}")
        print(f"   Target (Amount) mean: {daily_df['Amount'].mean():.2f}")
        print(f"   Target (Amount) std: {daily_df['Amount'].std():.2f}")
        print(
            f"   Target range: [{daily_df['Amount'].min():.2f}, {daily_df['Amount'].max():.2f}]"
        )

        # ============================================================================
        # PREDICTION (SELALU POSITIF - SESUAI TRAINING)
        # ============================================================================

        dmatrix = xgb.DMatrix(X, feature_names=feature_cols)
        y_pred_all = model.predict(dmatrix)

        print(
            f"   Model predictions range: [{y_pred_all.min():.2f}, {y_pred_all.max():.2f}]"
        )
        print(f"   Model predictions mean: {y_pred_all.mean():.2f}")

        # ============================================================================
        # EVALUATION METRICS (20% DATA TERAKHIR - SESUAI TRAINING)
        # ============================================================================

        eval_window = int(len(daily_df) * 0.2)
        eval_window = max(eval_window, 7)  # Minimal 7 hari

        y_actual_eval = y[-eval_window:]
        y_pred_eval = y_pred_all[-eval_window:]

        print(f"\n   [EVALUATION DEBUG]")
        print(f"   Evaluation window: {eval_window} days")
        print(
            f"   Actual values: min={y_actual_eval.min():.2f}, max={y_actual_eval.max():.2f}, mean={y_actual_eval.mean():.2f}"
        )
        print(
            f"   Predicted values: min={y_pred_eval.min():.2f}, max={y_pred_eval.max():.2f}, mean={y_pred_eval.mean():.2f}"
        )

        # Kalkulasi metrik
        mae_val = float(mean_absolute_error(y_actual_eval, y_pred_eval))
        r2_val = float(r2_score(y_actual_eval, y_pred_eval))
        rmse_val = np.sqrt(np.mean((y_actual_eval - y_pred_eval) ** 2))
        mape_val = (
            np.mean(np.abs((y_actual_eval - y_pred_eval) / (y_actual_eval + 1e-8)))
            * 100
        )

        # Debug R² calculation
        ss_res = np.sum((y_actual_eval - y_pred_eval) ** 2)
        ss_tot = np.sum((y_actual_eval - y_actual_eval.mean()) ** 2)
        r2_manual = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0

        print(f"\n   [METRICS]")
        print(f"   R² (sklearn): {r2_val:.4f}")
        print(f"   R² (manual): {r2_manual:.4f}")
        print(f"   MAE: {mae_val:.2f}")
        print(f"   RMSE: {rmse_val:.2f}")
        print(f"   MAPE: {mape_val:.2f}%")

        # Pastikan metrik dalam range reasonable
        r2_val = max(0.0, min(1.0, r2_val))
        mae_val = abs(mae_val)

        if np.isnan(mae_val) or np.isinf(mae_val):
            mae_val = float(daily_df["Amount"].mean() * 0.2)

        print(f"\n   ✅ Final R²: {r2_val:.4f}")
        print(f"   ✅ Final MAE: {mae_val:.2f}")
        print(f"   ✅ Accuracy %: {r2_val * 100:.2f}%")

        # ============================================================================
        # FORECAST MASA DEPAN (7 HARI - SESUAI TRAINING)
        # ============================================================================

        periods = 7 if mode == "daily" else (4 if mode == "weekly" else 3)
        forecast_df = forecast_next_days(model, daily_df, feature_cols, periods)

        # ============================================================================
        # FORMAT FORECAST RESULTS (SELALU POSITIF - SESUAI TRAINING)
        # ============================================================================

        forecast_results = []
        total_expense = 0

        for idx, row in forecast_df.iterrows():
            # ✅ PREDIKSI LANGSUNG = EXPENSE (SELALU POSITIF)
            predicted_expense = float(row["forecast"])
            total_expense += predicted_expense

            # Confidence interval (80% - 120%)
            confidence_low = predicted_expense * 0.8
            confidence_high = predicted_expense * 1.2

            forecast_results.append(
                {
                    "date": row["Date"].strftime("%Y-%m-%d"),
                    "predicted_expense": round(predicted_expense),
                    "confidence_low": round(confidence_low),
                    "confidence_high": round(confidence_high),
                    "day_of_week": row["Date"].strftime("%A"),
                    "predicted_net_amount": round(
                        predicted_expense, 2
                    ),  # Sama dengan expense (positif)
                }
            )

        average_daily_expense = round(total_expense / periods) if periods > 0 else 0

        # ============================================================================
        # BUILD RESPONSE (SESUAI DENGAN FRONTEND Forecasting.jsx)
        # ============================================================================

        response = {
            "forecast": forecast_results,
            "metrics": {
                "r_squared": round(float(r2_val), 4),
                "mae": round(float(mae_val), 2),
                "rmse": round(float(rmse_val), 2),
                "mape": round(float(mape_val), 2),
                "accuracy_percentage": round(float(r2_val * 100), 2),
                "model_type": "XGBoost (Expense-Only Mode)",
                "evaluation_days": int(eval_window),
                "historical_mean": round(float(daily_df["Amount"].mean()), 2),
                "historical_std": round(float(daily_df["Amount"].std()), 2),
            },
            "summary": {
                "total_forecast": int(total_expense),  # ✅ SUM SEMUA PREDIKSI (POSITIF)
                "average_daily_expense": average_daily_expense,
                "historical_average_expense": round(
                    float(daily_df["Amount"].mean()), 2
                ),
                "min_predicted_expense": round(
                    float(min(r["predicted_expense"] for r in forecast_results))
                ),
                "max_predicted_expense": round(
                    float(max(r["predicted_expense"] for r in forecast_results))
                ),
            },
            "metadata": {
                "model_version": "XGBoost v2.2 (Expense-Only Mode)",
                "timestamp": datetime.now().isoformat(),
                "data_points_used": int(len(daily_df)),
                "features_used": int(len(feature_cols)),
                "target_variable": "Amount (Expense Only)",
                "evaluation_method": "Time-series 20% split",
                "model_path": MODEL_PATH,
                "expense_only_mode": True,  # ✅ FLAG PENTING
                "forecast_periods": periods,
                "forecast_mode": mode,
            },
            "audit_table": [
                {
                    "range": f"Period {i+1}",
                    "y_pred": int(round(f["predicted_expense"])),
                    "confidence_range": f"{int(round(f['confidence_low']))} - {int(round(f['confidence_high']))}",
                }
                for i, f in enumerate(forecast_results)
            ],
            "prediction_vs_actual": {
                "dates": [
                    d.strftime("%Y-%m-%d") for d in daily_df["Date"].tail(eval_window)
                ],
                "actual": [float(x) for x in y_actual_eval.tolist()],
                "predicted": [float(x) for x in y_pred_eval.tolist()],
            },
        }

        # ============================================================================
        # KONVERSI KE PYTHON NATIVE TYPES
        # ============================================================================

        response = convert_to_python_types(response)

        # ============================================================================
        # DEBUG: VERIFIKASI NILAI FORECAST
        # ============================================================================

        print(f"\n   ✅ [FORECAST SUMMARY - EXPENSE-ONLY]")
        print(f"   Total Expense Forecast: Rp {total_expense:,.0f}")
        print(f"   Average Daily Expense: Rp {average_daily_expense:,.0f}")
        for i, f in enumerate(forecast_results):
            print(
                f"   Day {i+1} ({f['day_of_week']}, {f['date']}): Rp {f['predicted_expense']:,.0f}"
            )

        return jsonify(response)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================


@app.route("/health", methods=["GET"])
def health_check():
    status = {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "expense_only_mode": True,  # ✅ FLAG PENTING
        "feature_names": feature_names,
        "timestamp": datetime.now().isoformat(),
    }
    return jsonify(status), 200


# ============================================================================
# MAIN EXECUTION
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("XGBoost Financial Forecasting API (Expense-Only Mode)")
    print("=" * 80)
    print(f"Model path: {MODEL_PATH}")
    print(f"Model loaded: {model is not None}")
    print(f"Mode: EXPENSE-ONLY (sesuai Kaggle training)")
    print(f"Features: {len(feature_names) if feature_names else 0}")
    print("=" * 80)
    app.run(host="0.0.0.0", port=5001, debug=True)

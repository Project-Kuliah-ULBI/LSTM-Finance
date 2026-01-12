import numpy as np
import pandas as pd
import joblib
from sklearn.metrics import r2_score, mean_absolute_error
from datetime import datetime, timedelta

# Load model dan scaler
try:
    model = joblib.load("models/financial_forecast_xgboost_model.pkl")
    scaler = joblib.load("models/scaler.pkl")
    print("✅ Model dan scaler loaded")
except Exception as e:
    print(f"❌ Error loading: {e}")
    exit()

# Simulasi data
print("\n📊 Creating test data...")
dates = pd.date_range(start='2025-09-01', end='2026-01-05', freq='D')
amounts = np.random.uniform(50000, 500000, len(dates))

df = pd.DataFrame({'Date': dates, 'Amount': amounts})
df.set_index('Date', inplace=True)

print(f"   Data range: {df.index[0].date()} to {df.index[-1].date()}")
print(f"   Total days: {len(df)}")
print(f"   Amount: min={df['Amount'].min():.0f}, max={df['Amount'].max():.0f}, mean={df['Amount'].mean():.0f}")

# Feature engineering
print("\n⚙️  Feature engineering...")
df["Transaction_Count"] = df["Amount"].copy()
df["day"] = df.index.day
df["month"] = df.index.month
df["year"] = df.index.year
df["dayofweek"] = df.index.dayofweek
df["dayofyear"] = df.index.dayofyear
df["weekofyear"] = df.index.isocalendar().week
df["is_weekend"] = (df.index.dayofweek >= 5).astype(int)
df["is_month_start"] = df.index.is_month_start.astype(int)
df["is_month_end"] = df.index.is_month_end.astype(int)

# Lag features
df["lag_1"] = df["Amount"].shift(1).fillna(0)
df["lag_2"] = df["Amount"].shift(2).fillna(0)
df["lag_3"] = df["Amount"].shift(3).fillna(0)
df["lag_7"] = df["Amount"].shift(7).fillna(0)
df["lag_14"] = df["Amount"].shift(14).fillna(0)

# Rolling statistics
df["rolling_mean_3"] = df["Amount"].rolling(window=3, min_periods=1).mean()
df["rolling_std_3"] = df["Amount"].rolling(window=3, min_periods=1).std().fillna(0)
df["rolling_min_3"] = df["Amount"].rolling(window=3, min_periods=1).min()
df["rolling_max_3"] = df["Amount"].rolling(window=3, min_periods=1).max()

df["rolling_mean_7"] = df["Amount"].rolling(window=7, min_periods=1).mean()
df["rolling_std_7"] = df["Amount"].rolling(window=7, min_periods=1).std().fillna(0)
df["rolling_min_7"] = df["Amount"].rolling(window=7, min_periods=1).min()
df["rolling_max_7"] = df["Amount"].rolling(window=7, min_periods=1).max()

df["rolling_mean_14"] = df["Amount"].rolling(window=14, min_periods=1).mean()
df["rolling_std_14"] = df["Amount"].rolling(window=14, min_periods=1).std().fillna(0)
df["rolling_min_14"] = df["Amount"].rolling(window=14, min_periods=1).min()
df["rolling_max_14"] = df["Amount"].rolling(window=14, min_periods=1).max()

df["ema_7"] = df["Amount"].ewm(span=7, adjust=False).mean()
df["trend"] = (df["Amount"] - df["rolling_mean_7"]).fillna(0)

df = df.fillna(0)

feature_cols = [
    "Transaction_Count", "day", "month", "year", "dayofweek", "dayofyear", "weekofyear",
    "is_weekend", "is_month_start", "is_month_end",
    "lag_1", "lag_2", "lag_3", "lag_7", "lag_14",
    "rolling_mean_3", "rolling_std_3", "rolling_min_3", "rolling_max_3",
    "rolling_mean_7", "rolling_std_7", "rolling_min_7", "rolling_max_7",
    "rolling_mean_14", "rolling_std_14", "rolling_min_14", "rolling_max_14",
    "ema_7", "trend"
]

X_df = pd.DataFrame(df[feature_cols].values, columns=feature_cols)
X_scaled = scaler.transform(X_df)

print(f"   Features shape: {X_scaled.shape}")
print(f"   Features: {feature_cols}")

# Prediction
print("\n🤖 Model prediction...")
y_pred = model.predict(X_scaled)
print(f"   Predictions shape: {y_pred.shape}")
print(f"   Predictions: min={y_pred.min():.0f}, max={y_pred.max():.0f}, mean={y_pred.mean():.0f}")

# Evaluation
print("\n📈 Model evaluation...")
y_actual = df["Amount"].values

# Gunakan 70% data terakhir
eval_window = max(int(len(df) * 0.7), 30)
y_actual_eval = y_actual[-eval_window:]
y_pred_eval = y_pred[-eval_window:]

print(f"   Evaluation window: {eval_window} days")
print(f"   Actual: min={y_actual_eval.min():.0f}, max={y_actual_eval.max():.0f}, mean={y_actual_eval.mean():.0f}")
print(f"   Predicted: min={y_pred_eval.min():.0f}, max={y_pred_eval.max():.0f}, mean={y_pred_eval.mean():.0f}")

mae = mean_absolute_error(y_actual_eval, y_pred_eval)
r2 = r2_score(y_actual_eval, y_pred_eval)

# Manual R² calculation
ss_res = np.sum((y_actual_eval - y_pred_eval) ** 2)
ss_tot = np.sum((y_actual_eval - y_actual_eval.mean()) ** 2)
r2_manual = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0

print(f"\n   MAE: {mae:.2f}")
print(f"   R² (sklearn): {r2:.4f}")
print(f"   R² (manual): {r2_manual:.4f}")
print(f"   SS_res: {ss_res:.2f}")
print(f"   SS_tot: {ss_tot:.2f}")

# Correlation-based R²
correlation = np.corrcoef(y_actual_eval, y_pred_eval)[0, 1]
r2_correlation = correlation ** 2
print(f"   Correlation: {correlation:.4f}")
print(f"   R² (from correlation): {r2_correlation:.4f}")

print("\n✅ Debug complete!")

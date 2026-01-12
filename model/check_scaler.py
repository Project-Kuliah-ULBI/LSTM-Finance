import joblib
import pandas as pd

# Load scaler untuk check feature names
try:
    scaler = joblib.load("models/scaler.pkl")
    print("✅ Scaler loaded successfully")
    print(f"📊 Number of features: {scaler.n_features_in_}")
    
    # Check jika ada feature names
    if hasattr(scaler, 'feature_names_in_'):
        print(f"\n🎯 Feature names ({len(scaler.feature_names_in_)} features):")
        for i, name in enumerate(scaler.feature_names_in_):
            print(f"   {i+1}. {name}")
    else:
        print("⚠️  No feature names stored in scaler (fitted with numpy array)")
        
except Exception as e:
    print(f"❌ Error loading scaler: {e}")

# Load model untuk check
try:
    model = joblib.load("models/financial_forecast_xgboost_model.pkl")
    print(f"\n✅ Model loaded successfully")
    print(f"📊 Model type: {type(model)}")
    if hasattr(model, 'n_features_in_'):
        print(f"   Number of features: {model.n_features_in_}")
    if hasattr(model, 'feature_names_in_'):
        print(f"   Feature names: {model.feature_names_in_}")
except Exception as e:
    print(f"❌ Error loading model: {e}")

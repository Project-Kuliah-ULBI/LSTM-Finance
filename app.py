import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback # Untuk melihat detail error di terminal

app = Flask(__name__)
CORS(app)

model_path = 'best_model_temp.h5'
try:
    model = tf.keras.models.load_model(model_path)
    print("✅ Model LSTM berhasil dimuat!")
except Exception as e:
    print(f"❌ Gagal memuat model: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("📥 Data diterima dari Node.js:", data) # Debug Log

        input_data = data.get('expenses', [])

        if len(input_data) != 3:
            return jsonify({'error': 'Butuh tepat 3 data pengeluaran'}), 400

        # --- PREPROCESSING ---
        # Ubah ke numpy array
        features = np.array(input_data, dtype=np.float32)
        
        # Scaling Manual (Pastikan max_val tipe float biasa, bukan numpy)
        max_val = float(np.max(features)) 
        if max_val == 0: 
            max_val = 1.0
            
        scaled_features = features / max_val
        
        # Reshape: (1, 3, 1)
        final_input = scaled_features.reshape(1, 3, 1)

        # --- PREDIKSI ---
        # verbose=0 agar tidak nyampah di log terminal
        prediction_scaled = model.predict(final_input, verbose=0)
        
        # --- INVERSE SCALING (CRITICAL FIX) ---
        # Ambil angka dari array numpy -> konversi ke float Python biasa
        raw_prediction = float(prediction_scaled[0][0]) 
        
        # Kembalikan ke nominal asli
        final_prediction = raw_prediction * max_val

        # Bulatkan jadi integer Python biasa (bukan numpy.int)
        final_prediction_clean = int(round(final_prediction))

        response_data = {
            'input_last_3_months': input_data,
            'prediction_next_month': final_prediction_clean,
            'message': 'Prediksi berhasil'
        }
        
        print("📤 Mengirim hasil:", response_data) # Debug Log
        return jsonify(response_data)

    except Exception as e:
        # INI PENTING: Print error lengkap ke terminal biar kita tahu salahnya dimana
        print("❌ CRITICAL ERROR di Python:")
        traceback.print_exc() 
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
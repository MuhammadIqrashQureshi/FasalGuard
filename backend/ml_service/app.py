from flask import Flask, request, jsonify
from flask_cors import CORS
from model_predictor import predictor
import traceback
import numpy as np

def pad_to_365_days(features, target_days=365):
    """Pad 7 days of data to 365 days for model compatibility"""
    current_days = features.shape[1]
    if current_days >= target_days:
        return features[:, :target_days, :]
    
    # Pad with the mean of available days (better than zeros)
    padding_days = target_days - current_days
    mean_features = np.mean(features, axis=1, keepdims=True)
    padding = np.repeat(mean_features, padding_days, axis=1)
    padded_features = np.concatenate([features, padding], axis=1)
    return padded_features

app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    models_status = predictor.get_loaded_models()
    return jsonify({
        'status': 'healthy',
        'models_loaded': models_status['models_count'],
        'models': models_status['models'],
        'message': 'ML service running with pre-trained models'
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        weather_data = data.get('weather_data', [])
        crop = data.get('crop', 'cotton')
        model_type = data.get('model_type', 'gru')
        
        if not weather_data:
            return jsonify({'error': 'No weather data provided'}), 400
        
        print(f"\n📥 Received prediction request for {crop} using {model_type}")
        
        # Make prediction
        result = predictor.predict_yield(weather_data, crop, model_type)
        
        if 'error' in result:
            return jsonify(result), 400
        
        print(f"✅ Prediction successful: {result.get('predicted_yield', 'N/A')} tons/ha")
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Prediction endpoint error: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """Predict for multiple crops at once"""
    try:
        data = request.get_json()
        weather_data = data.get('weather_data', [])
        crops = data.get('crops', ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'])
        model_type = data.get('model_type', 'gru')
        
        results = {}
        for crop in crops:
            results[crop] = predictor.predict_yield(weather_data, crop, model_type)
        
        return jsonify({'predictions': results})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """List all loaded models"""
    return jsonify(predictor.get_loaded_models())

if __name__ == '__main__':
    print("🚀 Starting ML Prediction Service...")
    app.run(host='0.0.0.0', port=5001, debug=False)
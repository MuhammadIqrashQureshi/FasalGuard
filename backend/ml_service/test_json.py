#!/usr/bin/env python3
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

from satellite_predictor import satellite_predictor

result = satellite_predictor.analyze(31.30, 73.02, 'wheat', 'Faisalabad', None, '2026-01-15', None, None)

# Try to serialize with json.dumps
try:
    json_str = json.dumps(result)
    parsed = json.loads(json_str)
    print(f"JSON serialization OK")
    print(f"  weather_risk after round-trip: {parsed.get('weather_risk')}")
    print(f"  rec[0].priority_score after round-trip: {parsed['recommendations'][0].get('priority_score')}")
except Exception as e:
    print(f"JSON error: {e}")
    import traceback
    traceback.print_exc()

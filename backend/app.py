from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # enable CORS so frontend can call the backend

@app.route('/status', methods=['GET'])
def status():
    return jsonify({"message": "✅ Connection to backend established and running"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
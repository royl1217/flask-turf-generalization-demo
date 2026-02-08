import json
import subprocess
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Enable static folder
app = Flask(__name__, static_folder="static", static_url_path="/static")
CORS(app)

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


@app.route("/simplify", methods=["POST"])
def simplify():
    try:
        data = request.get_json()

        # Validate input
        if "type" not in data or data["type"] != "FeatureCollection":
            return jsonify({"error": "Input must be a FeatureCollection"}), 400

        # Prepare input for Node script
        node_input = json.dumps({
            "type": data["type"],
            "features": data["features"],
            "tolerance": data.get("tolerance", 0.001)
        })

        # Call Node + Turf.js
        result = subprocess.run(
            ["node", "simplify.js", node_input],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            return jsonify({"error": result.stderr}), 500

        simplified = json.loads(result.stdout)
        return jsonify(simplified)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Optional: serve index.html if needed
@app.route("/index")
def index():
    return send_from_directory(".", "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY escrow_api.py .

# Create a volume for the database
VOLUME /app/data

# Set environment variable for the database location
ENV DATABASE_PATH="/app/data/escrow.json"

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "escrow_api:app", "--host", "0.0.0.0", "--port", "8000"] 
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy application files
COPY auth.py .
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 8000

# Run FastAPI app
CMD ["uvicorn", "auth:app", "--host", "0.0.0.0", "--port", "8000"]

FROM python:3.10-slim

WORKDIR /app

COPY ml_service/requirements.txt ./ml_service/requirements.txt
RUN pip install --no-cache-dir -r ./ml_service/requirements.txt

COPY ml_service ./ml_service
COPY ml_models ./ml_models

WORKDIR /app/ml_service

ENV PYTHONUNBUFFERED=1
EXPOSE 5001

CMD ["python", "app.py"]

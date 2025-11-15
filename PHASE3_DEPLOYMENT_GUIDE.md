# SculptAI: Phase 3 Deployment Guide

This guide outlines the high-level steps to deploy the new components of the SculptAI system: the Next.js application, the Python data pipeline, and the Python ML service.

## Prerequisites

1.  **Vercel Account**: For deploying the Next.js frontend.
2.  **Google Cloud Platform (GCP) Account**: With a project created and billing enabled.
3.  **Docker**: Installed locally for building the ML service container.
4.  **Supabase Project**: With all migrations from the `supabase/migrations` directory applied.

---

## Step 1: Configure Environment Variables

Before deploying, you need to collect all necessary credentials and set them up for each service.

- Create a `.env.local` file for local Next.js development (see `.env.example`).
- Configure environment variables in Vercel for the Next.js production deployment.
- Configure secrets/environment variables in your chosen platform for the ML service (e.g., Cloud Run) and the data pipeline (e.g., GitHub Actions Secrets).

**Key Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for the data pipeline)
- `ML_SERVICE_URL` (The public URL of your deployed ML service)
- `GCP_CREDENTIALS_JSON` (The content of your GCP service account key JSON file, for GitHub Actions)
- `GCP_PROJECT_ID`
- `MODEL_PATH` (Path inside the ML container to the model file)

---

## Step 2: Deploy the ML Service (FastAPI)

The ML service is a containerized FastAPI application. We recommend deploying it to a serverless container platform like Google Cloud Run.

1.  **Create a Model File (Placeholder)**:
    The provided Dockerfile will create a dummy model file during the build process, so you don't need to create one manually for the first deployment. In a real scenario, you would replace this with your actual trained model file.

2.  **Build the Docker Image**:
    Navigate to the `ml_service` directory and run:
    ```bash
    docker build -t gcr.io/YOUR_GCP_PROJECT_ID/sculpt-ai-ml:v1 .
    ```

3.  **Push to Container Registry**:
    Push your image to Google Container Registry (GCR) or Artifact Registry.
    ```bash
    gcloud auth configure-docker
    docker push gcr.io/YOUR_GCP_PROJECT_ID/sculpt-ai-ml:v1
    ```

4.  **Deploy to Cloud Run**:
    Deploy the image using the `gcloud` CLI or the Google Cloud Console.
    ```bash
    gcloud run deploy sculpt-ai-ml-service \
      --image gcr.io/YOUR_GCP_PROJECT_ID/sculpt-ai-ml:v1 \
      --platform managed \
      --region YOUR_GCP_REGION \
      --allow-unauthenticated \
      --set-env-vars MODEL_PATH=/app/models/linear_regression_v1.joblib
    ```
    - **Note**: `--allow-unauthenticated` makes the API public. For production, you should place it behind an API Gateway or use IAM for authentication from your Next.js backend.

5.  **Get the Service URL**:
    Once deployed, Cloud Run will provide a public URL. **This is your `ML_SERVICE_URL`**.

---

## Step 3: Deploy the Data Pipeline (ETL Script)

The data pipeline script is designed to be run on a schedule. GitHub Actions is a great way to achieve this.

1.  **Set up BigQuery**:
    - In your GCP project, go to BigQuery.
    - Create a new dataset named `sculptai_analytics`.

2.  **Create GCP Service Account**:
    - In GCP IAM & Admin, create a service account with the "BigQuery Data Editor" role.
    - Create a JSON key for this service account and download it.

3.  **Configure GitHub Actions Secrets**:
    - In your GitHub repository settings, go to "Secrets and variables" > "Actions".
    - Create secrets for:
      - `SUPABASE_URL`
      - `SUPABASE_SERVICE_ROLE_KEY`
      - `GCP_PROJECT_ID`
      - `GCP_CREDENTIALS_JSON`: Copy the entire content of the JSON key file you downloaded.

4.  **Create a GitHub Actions Workflow**:
    - Create a file `.github/workflows/data_pipeline.yml`:
    ```yaml
    name: Run SculptAI Data Pipeline

    on:
      schedule:
        - cron: '0 0 * * *' # Runs every day at midnight UTC
      workflow_dispatch: # Allows manual runs

    jobs:
      run-etl:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout repository
            uses: actions/checkout@v3

          - name: Set up Python
            uses: actions/setup-python@v4
            with:
              python-version: '3.9'

          - name: Install dependencies
            run: pip install -r data_pipeline/requirements.txt

          - name: Create GCP Credentials File
            run: echo '${{ secrets.GCP_CREDENTIALS_JSON }}' > gcp-credentials.json
            
          - name: Run ETL Script
            env:
              SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
              SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
              GCP_PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
              GCP_CREDENTIALS_PATH: ./gcp-credentials.json
            run: python data_pipeline/extract_and_load.py
    ```

---

## Step 4: Deploy the Next.js Application

Vercel is the recommended platform for deploying the Next.js application.

1.  **Import Project**:
    - Connect your GitHub account to Vercel.
    - Import the SculptAI repository. Vercel will automatically detect it as a Next.js project.

2.  **Configure Environment Variables**:
    - In the Vercel project settings, add the following environment variables:
      - `NEXT_PUBLIC_SUPABASE_URL`
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - `ML_SERVICE_URL` (the URL from Step 2)

3.  **Deploy**:
    - Push your code to the `main` branch. Vercel will automatically build and deploy your application.
    - Vercel will provide you with the public URL for your live application.
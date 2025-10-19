# Deployment Guide

## Mobile App (React Native + Expo)

### Development Build
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Production Build

#### iOS (App Store)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### Android (Play Store)
```bash
# Build for Play Store
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

## Backend (FastAPI)

### Local Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp ../.env.example .env
# Edit .env with your API keys

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Docker Deployment
```bash
# Build image
docker build -t guardian-ai-backend .

# Run container
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name guardian-backend \
  guardian-ai-backend
```

### Kubernetes (Production)
```bash
# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Scale replicas
kubectl scale deployment guardian-backend --replicas=5
```

## Database Setup

### PostgreSQL + pgvector
```bash
# Install PostgreSQL 16
# macOS
brew install postgresql@16

# Ubuntu
sudo apt install postgresql-16

# Install pgvector extension
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Create database
createdb guardian_ai

# Run schema
psql guardian_ai < backend/database/schema.sql
```

### Managed Database (AWS RDS)
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier guardian-ai-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.1 \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 100

# Enable pgvector
psql -h <rds-endpoint> -U admin -d guardian_ai
CREATE EXTENSION vector;
```

## Infrastructure as Code

### Terraform (AWS)
```hcl
# main.tf
provider "aws" {
  region = "us-west-2"
}

# ECS Cluster
resource "aws_ecs_cluster" "guardian" {
  name = "guardian-ai-cluster"
}

# RDS PostgreSQL
resource "aws_db_instance" "guardian_db" {
  identifier = "guardian-ai-db"
  engine = "postgres"
  engine_version = "16.1"
  instance_class = "db.t3.medium"
  allocated_storage = 100
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "guardian_cache" {
  cluster_id = "guardian-cache"
  engine = "redis"
  node_type = "cache.t3.micro"
  num_cache_nodes = 1
}
```

Apply:
```bash
terraform init
terraform plan
terraform apply
```

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy Guardian AI

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Docker image
        run: |
          docker build -t guardian-ai-backend .
          docker push ${{ secrets.DOCKER_REGISTRY }}/guardian-ai-backend
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster guardian-ai-cluster \
            --service guardian-backend \
            --force-new-deployment

  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build iOS
        run: eas build --platform ios --non-interactive
      - name: Build Android
        run: eas build --platform android --non-interactive
```

## Monitoring

### Sentry (Error Tracking)
```bash
# Install Sentry SDK
npm install @sentry/react-native

# Initialize
import * as Sentry from '@sentry/react-native';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
});
```

### DataDog (APM)
```bash
# Install DataDog agent
docker run -d \
  --name datadog-agent \
  -e DD_API_KEY=$DD_API_KEY \
  -e DD_SITE="datadoghq.com" \
  datadog/agent:latest
```

## Security Checklist

- [ ] Enable TLS 1.3 on all endpoints
- [ ] Rotate JWT secrets monthly
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable DDoS protection
- [ ] Configure rate limiting
- [ ] Set up audit logging
- [ ] Enable database encryption at rest
- [ ] Configure VPC security groups
- [ ] Set up secrets management (AWS Secrets Manager)
- [ ] Enable multi-factor authentication for admin access

## Performance Optimization

### CDN Setup (CloudFront)
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name api.guardian.ai \
  --default-cache-behavior "ViewerProtocolPolicy=redirect-to-https"
```

### Database Optimization
```sql
-- Add read replicas
-- Enable connection pooling (PgBouncer)
-- Set up query caching

-- Optimize indexes
ANALYZE conversations;
REINDEX INDEX idx_conversations_embedding;
```

## Backup & Recovery

### Automated Backups
```bash
# PostgreSQL backup (daily)
pg_dump guardian_ai | gzip > backup_$(date +%Y%m%d).sql.gz

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://guardian-backups/
```

### Disaster Recovery
```bash
# Restore from backup
gunzip -c backup_20251011.sql.gz | psql guardian_ai

# Verify data integrity
psql guardian_ai -c "SELECT COUNT(*) FROM conversations;"
```

# 🚀 Deploy vanuit GitHub naar Cloud Run

## Stap 1: Push code naar GitHub

```bash
# Run het push script
./push-to-github.sh
```

Dit doet automatisch:
- Git init
- Add remote
- Commit alle files
- Push naar GitHub

## Stap 2: Deploy vanuit Cloud Console (Makkelijkst!)

1. **Open Cloud Run Console**
   https://console.cloud.google.com/run

2. **Klik "CREATE SERVICE"**

3. **Kies "Continuously deploy from a repository"**
   - Setup with Cloud Build
   - Authorize GitHub access

4. **Selecteer je repository**
   - Repository: `vadupdawg/groeimetai-platform`
   - Branch: `main`

5. **Build Configuration**
   - Build Type: `Dockerfile`
   - Source location: `/` (root)

6. **Service settings**
   - Service name: `groeimetai-platform`
   - Region: `europe-west4`
   - CPU allocation: `CPU is only allocated during request processing`
   - Minimum instances: `0`
   - Maximum instances: `100`

7. **Authentication**
   - ✅ Allow unauthenticated invocations

8. **Environment Variables** (Click "Variables & Secrets")
   ```
   OPENAI_API_KEY = [Secret Manager reference]
   PINECONE_API_KEY = [Secret Manager reference]
   NEXTAUTH_SECRET = [Secret Manager reference]
   ```

9. **Click CREATE**

## Stap 3: Automatic Deployment Setup ✨

Na de eerste deployment:
- Elke push naar `main` branch triggert automatisch een nieuwe deployment
- Build logs zijn zichtbaar in Cloud Console
- Rollback is mogelijk via revision management

## Alternative: Deploy via CLI

```bash
# Direct deploy vanuit GitHub URL
gcloud run deploy groeimetai-platform \
  --source-url https://github.com/vadupdawg/groeimetai-platform \
  --region europe-west4 \
  --allow-unauthenticated
```

## Monitoring

### Check deployment status:
```bash
gcloud run services describe groeimetai-platform --region europe-west4
```

### View logs:
```bash
gcloud run logs read --service groeimetai-platform --region europe-west4
```

### Get service URL:
```bash
gcloud run services list --platform managed
```

## Tips

1. **Secrets Management**
   - Gebruik Secret Manager voor API keys
   - Nooit hardcoded secrets in code!

2. **Custom Domain**
   ```bash
   gcloud run domain-mappings create \
     --service groeimetai-platform \
     --domain groeimetai.nl \
     --region europe-west4
   ```

3. **CI/CD Pipeline**
   - Cloud Build triggert automatisch bij GitHub pushes
   - Check build history in Cloud Console

4. **Rollback**
   ```bash
   gcloud run services update-traffic groeimetai-platform \
     --to-revisions REVISION_NAME=100 \
     --region europe-west4
   ```

## Troubleshooting

### Build fails?
- Check `cloudbuild.yaml` syntax
- Verify Dockerfile builds locally: `docker build .`
- Check Cloud Build logs

### Service not starting?
- Check environment variables
- Verify port 3000 is exposed
- Check application logs

### Performance issues?
- Increase memory: `--memory 2Gi`
- Increase CPU: `--cpu 2`
- Set min instances: `--min-instances 1`

## Success! 🎉

Je app is nu:
- ✅ Op GitHub
- ✅ Auto-deploying naar Cloud Run
- ✅ Schaalbaar en serverless
- ✅ Met HTTPS endpoint

URL format: `https://groeimetai-platform-[HASH]-ew.a.run.app`
aws s3 sync ./dist/ s3://>>>bucket_name<<<
aws cloudfront create-invalidation --distribution-id >>>distribution-id<<< --paths "/*"
PAUSE

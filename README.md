# PropertyManagement

## Property upload flow
1. User uploads rental contract
2. The details get sent to an endpoint to extract the data
3. The data gets displayed to the user
4. The user can edit the data
5. The user submits the data to our DB

## Testing with Docker
After running docker from instructions in contract-extractor project, replace the endpoint with localhost:8080/extract
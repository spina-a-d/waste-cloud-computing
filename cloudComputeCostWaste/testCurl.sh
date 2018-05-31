curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"user":"test", "token":"xyz", "data":["hello", "world"]}' \
  http://localhost:3000/
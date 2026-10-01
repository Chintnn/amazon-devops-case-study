#!/bin/bash
# Generates traffic so Grafana has data. Usage: bash scripts/load.sh [base-url]
URL=${1:-http://localhost:30081}
for i in $(seq 1 300); do
  curl -s "$URL/api/products" > /dev/null
  curl -s -X POST "$URL/api/orders" -H "Content-Type: application/json" -d '{"productId":1,"quantity":1}' > /dev/null
  if [ $((i % 5)) -eq 0 ]; then curl -s "$URL/chaos/error" > /dev/null; fi
  sleep 0.5
done
echo "load finished"
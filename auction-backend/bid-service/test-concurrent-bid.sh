##!/bin/bash
#
## ----------------------------------------------
## This script tests concurrent bids for an auction service.
## It sends two bids almost simultaneously from different users.
## Make sure the auction service is running before executing this script.
##
## Usage: ./test-concurrent-bid.sh
## ----------------------------------------------
#
## Color codes
#GREEN='\033[0;32m'
#RED='\033[0;31m'
#YELLOW='\033[1;33m'
#BOLD='\033[1m'
#NC='\033[0m' # No Color
#
## Gửi 2 bid gần như đồng thời
#API_URL="http://localhost:8085/api/bids"
#
#echo -e "${BOLD}${YELLOW}▶ Starting concurrent bid test...${NC}"
#
## Gửi bid user 3 (chạy ngầm bằng &)
#echo -e "${BOLD}👤 User 3 bidding 3,000...${NC}"
#curl -s -X POST "$API_URL" \
#  -H "Content-Type: application/json" \
#  -d '{
#    "auctionId": 4,
#    "userId": 3,
#    "bidAmount": 5000
#  }' > /tmp/response_user3.json &
#
## Gửi bid user 4 (chạy ngầm bằng &)
#echo -e "${BOLD}👤 User 4 bidding 4,000...${NC}"
#curl -s -X POST "$API_URL" \
#  -H "Content-Type: application/json" \
#  -d '{
#    "auctionId": 4,
#    "userId": 4,
#    "bidAmount": 6000
#  }' > /tmp/response_user4.json &
#
## Chờ cả 2 tiến trình
#wait
#
## In kết quả
#echo -e "\n${BOLD}${YELLOW}📦 Response from User 3:${NC}"
#cat /tmp/response_user3.json
#
#echo -e "\n${BOLD}${YELLOW}📦 Response from User 4:${NC}"
#cat /tmp/response_user4.json
#
#echo -e "\n${GREEN}✅ Done sending concurrent bids.${NC}"
#!/bin/bash

# Gửi 2 bid gần như cùng lúc

API_URL="http://localhost:8085/api/bids"

# Bid của user 3
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{
  "auctionId": 4,
  "userId": 3,
  "bidAmount": 10000
}' &

# Bid của user 4
curl -s -X POST "$API_URL" -H "Content-Type: application/json" -d '{
  "auctionId": 4,
  "userId": 4,
  "bidAmount": 12000
}' &

# Chờ cả 2 lệnh hoàn tất
wait

echo -e "\n✅ Done sending concurrent bids."



echo "Deploy toàn bộ ứng dụng Mail_Web"

echo "Dừng các container cũ"
docker compose down

echo "Build lại image"
docker compose build --no-cache

echo "Khởi động container"
docker compose up -d

echo "Danh sách container đang chạy:"
docker ps

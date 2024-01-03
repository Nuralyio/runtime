if docker-compose ps | grep -q 'Up'; then
    docker-compose down
else
    echo "No containers are currently running."
fi

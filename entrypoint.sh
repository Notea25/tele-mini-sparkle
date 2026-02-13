#!/bin/sh
echo "PORT is: ${PORT:-not set}"
echo "Before sed:"
head -3 /etc/nginx/conf.d/default.conf
sed -i "s/listen 80;/listen ${PORT:-80};/" /etc/nginx/conf.d/default.conf
echo "After sed:"
head -3 /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
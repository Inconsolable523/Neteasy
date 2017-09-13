#!bin/sh

gulp
tar cvfz - dist/** index.html | ssh root@123.207.29.39  "cd /usr/share/nginx/neteasy; rm -rf dist.tar.gz; tar xvfz -;"

exit
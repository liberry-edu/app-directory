##Introduction

This is a demo app which may or may not be included in the actual deployment.It is meant to serve as an example of how the frontend app, node.js server and nginx server would interact. This includes serving the frontend app through nginx, service the content through nginx and hosting the api on node.js. It also shows how to manage authentication through browser local storage.

To try this out, run the backend server on localhost:8080, run the nginx server with given configuration, add the liberry.edu entry in your /etc/hosts and then access liberry.edu on your browser.

Since the app reads the data from the DB and then displays it, you need to create some entries in the 'app' table of the database first.

##NGINX config

    server {
          listen 80 default_server;
          listen [::]:80 default_server ipv6only=on;
  
          # Make site accessible from http://localhost/
          server_name liberry.edu;
  
          location /content/ {
                  root /home/user-1/liberry/;
          }
  
          location / {
                  root /home/user-1/Documents/Work/Liberry/app-directory/;
          }
  
          location /api/ {
                  proxy_pass http://localhost:8080/;
          }
    }

##Hosts config

    127.0.0.1       liberry.edu


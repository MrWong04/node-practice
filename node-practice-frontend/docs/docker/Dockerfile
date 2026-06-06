FROM nginx:1.24.0-alpine3.17-slim
MAINTAINER fengxiqiu "fengxiqiu@aspirecn.com"

LABEL version=1.0.0

ADD youcan-h5/docker/server.conf  /etc/nginx/conf.d/default.conf
ADD youcan-h5/docker/nginx.conf  /etc/nginx/nginx.conf
ADD youcan-h5/dist /usr/share/nginx/html/

VOLUME ["/usr/share/nginx/html"]
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

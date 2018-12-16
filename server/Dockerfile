FROM ubuntu

WORKDIR /opt
RUN apt-get update
RUN apt-get install -y tar git curl nano wget dialog net-tools build-essential python python-dev python-distribute python-pip default-libmysqlclient-dev
RUN apt-get update

RUN pip install --upgrade pip
COPY requirements.txt /opt/requirements.txt
RUN pip install -r requirements.txt

COPY app /opt/app
COPY files /opt/files
COPY static /opt/static
#COPY config.prod.py /opt/config.py
COPY server.py /opt/server.py

EXPOSE 8080

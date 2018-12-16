FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y curl wget gnupg

RUN bash -c "$(curl -L install.crate.io)"
RUN apt-get install -y systemd
RUN apt-get update

RUN systemctl start crate
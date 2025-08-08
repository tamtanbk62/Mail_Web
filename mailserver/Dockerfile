FROM ubuntu:22.04

ENV TZ=Asia/Ho_Chi_Minh
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    apt-get install -y \
        postfix postfix-mysql \
        dovecot-core dovecot-imapd dovecot-pop3d dovecot-lmtpd dovecot-mysql \
        supervisor mysql-client \
        rsyslog && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 5000 vmail && \
    useradd -g vmail -u 5000 vmail -d /var/mail -m -s /sbin/nologin

RUN mkdir -p /var/mail/vhosts && \
    chown -R vmail:vmail /var/mail/vhosts

RUN echo "yourdomain.com" > /etc/mailname

RUN touch /var/log/mail.log && \
    chown syslog:adm /var/log/mail.log

COPY ./postfix /etc/postfix
COPY ./dovecot /etc/dovecot
COPY ./supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 25 587 143 993

CMD ["/usr/bin/supervisord"]
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Cài các gói cần thiết, thêm rsyslog
RUN apt update && \
    apt install -y \
        postfix postfix-mysql \
        dovecot-core dovecot-imapd dovecot-pop3d dovecot-lmtpd dovecot-mysql \
        supervisor mysql-client \
        rsyslog && \
    apt clean && rm -rf /var/lib/apt/lists/*

# Tạo user vmail
RUN groupadd -g 5000 vmail && \
    useradd -g vmail -u 5000 vmail -d /var/mail -m -s /sbin/nologin

# Tạo thư mục mailbox
RUN mkdir -p /var/mail/vhosts && \
    chown -R vmail:vmail /var/mail/vhosts

# Đặt tên miền chính
RUN echo "yourdomain.com" > /etc/mailname

# Tạo file log nếu chưa có
RUN touch /var/log/mail.log && \
    chown syslog:adm /var/log/mail.log

# Copy cấu hình
COPY ./postfix /etc/postfix
COPY ./dovecot /etc/dovecot
COPY ./supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Mở cổng
EXPOSE 25 587 143 993

# Khởi động supervisor
CMD ["/usr/bin/supervisord"]

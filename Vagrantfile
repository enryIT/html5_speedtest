
# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "ubuntu/trusty64"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # config.vm.network "forwarded_port", guest: 80, host: 8080
  config.vm.network "private_network", ip: "192.168.33.10"
  config.vm.hostname = "speedtest.local"

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # NFS
  #config.vm.synced_folder '.', '/vagrant', nfs: true

  #config.sshfs.paths = { "/vagrant" => "." }
  #config.sshfs.username = "vagrant"
  #config.sshfs.mount_on_guest = true
  #config.sshfs.paths = { "." => "/vagrant" }
  #config.sshfs.host_addr = '192.168.33.1'

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  config.vm.provider "virtualbox" do |vb|
    # Display the VirtualBox GUI when booting the machine
    # vb.gui = true

    # Customize the amount of memory on the VM:
    vb.memory = "512"
    vb.cpus = 1
  end

  # View the documentation for the provider you are using for more
  # information on available options.

  # Define a Vagrant Push strategy for pushing to Atlas. Other push strategies
  # such as FTP and Heroku are also available. See the documentation at
  # https://docs.vagrantup.com/v2/push/atlas.html for more information.
  # config.push.define "atlas" do |push|
  #   push.app = "YOUR_ATLAS_USERNAME/YOUR_APPLICATION_NAME"
  # end

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", inline: <<-SHELL
    # UPDATE PACKAGES
    apt-get update
    cd /vagrant

    # INSTALL DB SERVER
    # http://docs.travis-ci.com/user/database-setup/
    # mysql; pgsql; sqlite
    DBENGINE=mysql 
    APPENV=local
    DBHOST=localhost
    DBUSER=root
    DBPASSWD=password
    DBNAME=speedtest

    echo "mysql-server mysql-server/root_password password $DBPASSWD" | debconf-set-selections
    echo "mysql-server mysql-server/root_password_again password $DBPASSWD" | debconf-set-selections
    apt-get install -y mysql-server mysql-server-5.5

    sh -c "if [ '$DBENGINE' = 'pgsql' ]; then psql -c 'DROP DATABASE IF EXISTS $DBNAME;' -U postgres; fi"
    sh -c "if [ '$DBENGINE' = 'mysql' ]; then mysql --user=$DBUSER --password=$DBPASSWD -e 'DROP DATABASE IF EXISTS $DBNAME;'; fi"

    sh -c "if [ '$DBENGINE' = 'pgsql' ]; then psql -c 'CREATE DATABASE $DBNAME;' -U postgres; fi"
    sh -c "if [ '$DBENGINE' = 'mysql' ]; then mysql --user=$DBUSER --password=$DBPASSWD -e 'CREATE DATABASE IF NOT EXISTS $DBNAME;'; fi"

    # INSTALL PACKAGES
    apt-get install -y unzip apache2 php5-cli php5-curl php5-mysqlnd php5-common libapache2-mod-fcgid php5-cgi libapache2-mod-php5

    # PREPARING APACHE2
    a2enmod fcgid
    if ! [ -L /var/www ]; then
      rm -rf /var/www
      mkdir -p /var/www
      chown -R www-data:www-data /var/www
      chmod 755 /var/www
    fi
    echo "<VirtualHost *:80>
            DocumentRoot /var/www
            ErrorLog ${APACHE_LOG_DIR}/error.log
            CustomLog ${APACHE_LOG_DIR}/access.log combined
          </VirtualHost>" > /etc/apache2/sites-enabled/000-default.conf

    # DEPLOYING FILES
    cd /var/www
    wget https://github.com/enryIT/html5_speedtest/archive/master.zip
    unzip master.zip
    rm master.zip
    
    # EDIT php.ini
    echo 'echo "memory_limit = 256M" >> /etc/php5/apache2/conf.d/user.ini' | sudo -s
    echo 'echo "upload_max_filesize = 200M" >> /etc/php5/apache2/conf.d/user.ini' | sudo -s
    echo 'echo "post_max_size = 200M" >> /etc/php5/apache2/conf.d/user.ini' | sudo -s
    touch /var/www/phpinfo.php
    echo "<?php phpinfo() ?>" > /var/www/phpinfo.php

    service apache2 restart

  SHELL
end


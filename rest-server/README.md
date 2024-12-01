# REST сервис для работы с водным sharing такси

## Использование

Для ознакомления с документацией необходимо использовать рут `/docs/`

Для входа в админ панель необходимо использовать рут `/admin/`

## Деплой на сервер

Загрузка необходимых компонентов

`sudo apt install -y python3 python3-dev python3-venv rabbitmq-server`

В директории проекта

`python3 -m venv venv`

`source venv/bin/activate`

`pip install -r requirements.txt`

Тестовый запуск проекта

`python manage.py runserver 0.0.0.0:8080`
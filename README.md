# Smartjeneva - Water Sharing Taxi

## Описание проекта

Проект представляет собой систему для предсказания и управления маршрутами водного такси, которая включает в себя несколько компонентов, таких как серверы, анализ данных, моделирование предсказаний и интерфейс для пользователей.
# Команда
##    Владислав — Backend
##    Владимир — Backend
##    Евгений — ML Specialist

# Как запустить проект

## Шаг 1: Клонировать репозиторий

Сначала клонируйте репозиторий с GitHub:

`git clone https://github.com/your-username/your-repository.git
cd your-repository`

## Шаг 2: Установить зависимости

Установите все необходимые зависимости для каждого компонента проекта.

Для <u>data-parser</u>:

Перейдите в каталог <u>data-parser</u> и установите зависимости:

`cd data-parser
pip install -r requirements.txt`

Для <u>prediction</u>:

Перейдите в каталог <u>prediction</u> и установите зависимости:

`cd prediction
pip install -r requirements.txt`

Для <u>rest-server</u>:

Перейдите в каталог <u>rest-server</u> и установите зависимости:

`cd rest-server
pip install -r requirements.txt`

Для <u>vehicle-emulator</u>:

Перейдите в каталог <u>vehicle-emulator</u> и установите зависимости:

`cd vehicle-emulator
pip install -r requirements.txt`

Для <u>front</u>:

Перейдите в каталог <u>front</u> и установите все зависимости для фронтенда:

`cd front
npm install`

## Шаг 3: Запуск серверов

Запустите сервер предсказаний:

`cd rest-server
python manage.py runserver`

Запустите эмулятор транспортного средства:

`cd vehicle-emulator
python main.py`

Для запуска фронтенда:

`cd front
ng serve`

## Шаг 4: Подключение к базе данных

Вам необходимо настроить доступ к базе данных для правильной работы системы. Убедитесь, что у вас настроены правильные параметры в файле settings_private.py внутри папки rest-server/sharing_taxi.

# Видео демонстрация

Видео, демонстрирующее работоспособность прототипа, доступно по ссылке на https://drive.google.com/file/d/17O7tkdtI_cfr5j2fSJYef9xx_l4Z1zho/view?usp=sharing.

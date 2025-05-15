/**
 * Скрипт для валидации и обработки формы контактов
 */

document.addEventListener('DOMContentLoaded', function() {
    // Получаем форму и элемент для сообщений
    const contactForm = document.getElementById('ajax-contact');
    const formMessages = document.getElementById('form-messages');

    // Добавляем обработчик события отправки формы
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            // Предотвращаем стандартную отправку формы
            event.preventDefault();
            
            // Проверяем валидность формы
            if (validateForm()) {
                // Если форма валидна, отправляем данные через AJAX
                sendFormData();
            }
        });
    }

    // Функция валидации формы
    function validateForm() {
        let isValid = true;
        const nameInput = document.getElementById('f_name');
        const lastNameInput = document.getElementById('l_name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        
        // Сбрасываем предыдущие ошибки
        resetErrors();
        
        // Проверка имени (только буквы, минимум 2 символа)
        if (!nameInput.value.trim() || nameInput.value.trim().length < 2 || !/^[А-Яа-яЁёA-Za-z\s]+$/.test(nameInput.value.trim())) {
            showError(nameInput, 'Пожалуйста, введите корректное имя (минимум 2 буквы)');
            isValid = false;
        }
        
        // Проверка фамилии (только буквы, минимум 2 символа)
        if (!lastNameInput.value.trim() || lastNameInput.value.trim().length < 2 || !/^[А-Яа-яЁёA-Za-z\s]+$/.test(lastNameInput.value.trim())) {
            showError(lastNameInput, 'Пожалуйста, введите корректную фамилию (минимум 2 буквы)');
            isValid = false;
        }
        
        // Проверка email
        if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            showError(emailInput, 'Пожалуйста, введите корректный email адрес');
            isValid = false;
        }
        
        // Проверка темы (минимум 3 символа)
        if (!subjectInput.value.trim() || subjectInput.value.trim().length < 3) {
            showError(subjectInput, 'Пожалуйста, введите тему сообщения (минимум 3 символа)');
            isValid = false;
        }
        
        // Проверка сообщения (минимум 10 символов)
        if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
            showError(messageInput, 'Пожалуйста, введите сообщение (минимум 10 символов)');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Функция для отображения ошибки
    function showError(inputElement, errorMessage) {
        // Добавляем класс ошибки к элементу
        inputElement.classList.add('is-invalid');
        
        // Создаем элемент с сообщением об ошибке
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = errorMessage;
        
        // Добавляем сообщение после элемента ввода
        inputElement.parentNode.appendChild(errorDiv);
        
        // Добавляем обработчик для удаления ошибки при вводе
        inputElement.addEventListener('input', function() {
            this.classList.remove('is-invalid');
            const feedback = this.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.remove();
            }
        }, { once: true });
    }
    
    // Функция для сброса всех ошибок
    function resetErrors() {
        // Удаляем все классы ошибок
        document.querySelectorAll('.is-invalid').forEach(function(element) {
            element.classList.remove('is-invalid');
        });
        
        // Удаляем все сообщения об ошибках
        document.querySelectorAll('.invalid-feedback').forEach(function(element) {
            element.remove();
        });
        
        // Очищаем общие сообщения формы
        formMessages.innerHTML = '';
        formMessages.className = '';
    }
    
    // Функция для отправки данных формы через AJAX
    function sendFormData() {
        // Получаем данные формы
        const formData = new FormData(contactForm);
        
        // Показываем индикатор загрузки
        showLoadingIndicator();
        
        // Блокируем кнопку отправки
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Отправка...';
        
        // Создаем и настраиваем AJAX запрос
        const xhr = new XMLHttpRequest();
        xhr.open('POST', contactForm.getAttribute('action'), true);
        xhr.setRequestHeader('Accept', 'application/json');
        
        // Обработчик ответа
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                // Скрываем индикатор загрузки
                hideLoadingIndicator();
                
                // Восстанавливаем кнопку
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                
                // Очищаем сообщения
                formMessages.innerHTML = '';
                
                if (xhr.status === 200) {
                    try {
                        // Пытаемся разобрать JSON ответ
                        const response = JSON.parse(xhr.responseText);
                        
                        if (response.success === true) {
                            // Показываем сообщение об успехе
                            formMessages.classList.add('alert', 'alert-success');
                            formMessages.innerHTML = response.message || 'Ваше сообщение успешно отправлено!';
                            
                            // Прокручиваем к сообщению
                            formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            
                            // Очищаем форму
                            contactForm.reset();
                        } else {
                            // Обработка ошибки из успешного HTTP-ответа
                            formMessages.classList.add('alert', 'alert-danger');
                            formMessages.innerHTML = response.message || 'Произошла ошибка при отправке сообщения.';
                            formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } catch (e) {
                        // Если не удалось разобрать JSON, показываем общую ошибку
                        formMessages.classList.add('alert', 'alert-danger');
                        formMessages.innerHTML = 'Ошибка обработки ответа сервера. Пожалуйста, попробуйте позже.';
                        formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } else {
                    // Обработка ошибки
                    formMessages.classList.add('alert', 'alert-danger');
                    
                    try {
                        // Пытаемся разобрать JSON ответ с ошибкой
                        const response = JSON.parse(xhr.responseText);
                        formMessages.innerHTML = response.message || 'Произошла ошибка при отправке сообщения.';
                    } catch (e) {
                        // Если не удалось разобрать JSON, показываем общую ошибку
                        formMessages.innerHTML = 'Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже.';
                    }
                    
                    // Прокручиваем к сообщению об ошибке
                    formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        };
        
        // Обработка ошибки сети
        xhr.onerror = function() {
            // Скрываем индикатор загрузки
            hideLoadingIndicator();
            
            // Восстанавливаем кнопку
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
            formMessages.classList.add('alert', 'alert-danger');
            formMessages.innerHTML = 'Ошибка соединения. Пожалуйста, проверьте подключение к интернету и попробуйте снова.';
            
            // Прокручиваем к сообщению об ошибке
            formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        
        // Устанавливаем таймаут для запроса (10 секунд)
        xhr.timeout = 10000;
        xhr.ontimeout = function() {
            // Скрываем индикатор загрузки
            hideLoadingIndicator();
            
            // Восстанавливаем кнопку
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
            formMessages.classList.add('alert', 'alert-danger');
            formMessages.innerHTML = 'Превышено время ожидания ответа от сервера. Пожалуйста, попробуйте позже.';
            
            // Прокручиваем к сообщению об ошибке
            formMessages.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        
        // Отправляем данные
        xhr.send(formData);
    }
    
    // Функция для отображения индикатора загрузки
    function showLoadingIndicator() {
        // Проверяем, существует ли уже индикатор
        if (!document.getElementById('form-loading-indicator')) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'form-loading-indicator';
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="sr-only">Загрузка...</span></div>';
            
            // Добавляем индикатор перед сообщениями формы
            formMessages.parentNode.insertBefore(loadingIndicator, formMessages);
        } else {
            document.getElementById('form-loading-indicator').style.display = 'block';
        }
    }
    
    // Функция для скрытия индикатора загрузки
    function hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('form-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
    
    // Добавляем стили для валидации
    addValidationStyles();
    
    // Функция для добавления стилей валидации
    function addValidationStyles() {
        // Проверяем, существует ли уже стиль
        if (!document.getElementById('validation-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'validation-styles';
            styleElement.textContent = `
                .is-invalid {
                    border-color: #dc3545 !important;
                    padding-right: calc(1.5em + 0.75rem) !important;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e") !important;
                    background-repeat: no-repeat !important;
                    background-position: right calc(0.375em + 0.1875rem) center !important;
                    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem) !important;
                }
                .invalid-feedback {
                    display: block !important;
                    width: 100% !important;
                    margin-top: 0.25rem !important;
                    font-size: 80% !important;
                    color: #dc3545 !important;
                }
                .alert {
                    position: relative !important;
                    padding: 0.75rem 1.25rem !important;
                    margin-bottom: 1rem !important;
                    border: 1px solid transparent !important;
                    border-radius: 0.25rem !important;
                }
                .alert-success {
                    color: #155724 !important;
                    background-color: #d4edda !important;
                    border-color: #c3e6cb !important;
                }
                .alert-danger {
                    color: #721c24 !important;
                    background-color: #f8d7da !important;
                    border-color: #f5c6cb !important;
                }
                /* Стили для индикатора загрузки */
                .loading-indicator {
                    display: flex;
                    justify-content: center;
                    margin: 20px 0;
                }
                .spinner-border {
                    display: inline-block;
                    width: 2rem;
                    height: 2rem;
                    vertical-align: text-bottom;
                    border: 0.25em solid currentColor;
                    border-right-color: transparent;
                    border-radius: 50%;
                    animation: spinner-border .75s linear infinite;
                }
                .text-primary {
                    color: #007bff !important;
                }
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
                /* Стиль для спиннера в кнопке */
                .spinner {
                    display: inline-block;
                    width: 1rem;
                    height: 1rem;
                    vertical-align: text-bottom;
                    border: 0.2em solid currentColor;
                    border-right-color: transparent;
                    border-radius: 50%;
                    animation: spinner-border .75s linear infinite;
                    margin-right: 0.5rem;
                }
                /* Анимация для спиннера */
                @keyframes spinner-border {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styleElement);
        }
    }
});
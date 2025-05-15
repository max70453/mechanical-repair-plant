<?php
/**
 * Обработчик формы контактов
 * Имитация отправки сообщения с логированием данных
 */

// Устанавливаем заголовки для ответа в формате JSON
header("Content-Type: application/json");

// Имитация задержки обработки запроса (0.5-1.5 секунды)
sleep(rand(1, 3));

// Проверяем метод запроса
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    // Если метод не POST, возвращаем ошибку
    echo json_encode([
        "success" => false,
        "message" => "Неверный метод запроса. Используйте POST."
    ]);
    exit;
}

// Получаем данные из формы
$f_name = isset($_POST["f_name"]) ? trim($_POST["f_name"]) : "";
$l_name = isset($_POST["l_name"]) ? trim($_POST["l_name"]) : "";
$email = isset($_POST["email"]) ? trim($_POST["email"]) : "";
$subject = isset($_POST["subject"]) ? trim($_POST["subject"]) : "";
$message = isset($_POST["message"]) ? trim($_POST["message"]) : "";

// Проверяем обязательные поля
if (empty($f_name) || empty($l_name) || empty($email) || empty($subject) || empty($message)) {
    echo json_encode([
        "success" => false,
        "message" => "Пожалуйста, заполните все обязательные поля."
    ]);
    exit;
}

// Проверяем корректность email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Пожалуйста, введите корректный email адрес."
    ]);
    exit;
}

// Проверяем длину имени и фамилии (минимум 2 символа)
if (mb_strlen($f_name) < 2 || mb_strlen($l_name) < 2) {
    echo json_encode([
        "success" => false,
        "message" => "Имя и фамилия должны содержать минимум 2 символа."
    ]);
    exit;
}

// Проверяем длину темы (минимум 3 символа)
if (mb_strlen($subject) < 3) {
    echo json_encode([
        "success" => false,
        "message" => "Тема сообщения должна содержать минимум 3 символа."
    ]);
    exit;
}

// Проверяем длину сообщения (минимум 10 символов)
if (mb_strlen($message) < 10) {
    echo json_encode([
        "success" => false,
        "message" => "Сообщение должно содержать минимум 10 символов."
    ]);
    exit;
}

// Логирование полученных данных (для демонстрации)
$log_file = __DIR__ . "/contact_log.txt";
$log_data = date("Y-m-d H:i:s") . " - Новое сообщение от: {$f_name} {$l_name} ({$email})\nТема: {$subject}\nСообщение: {$message}\n\n";

// Записываем в лог-файл с обработкой ошибок
try {
    // Проверяем, доступна ли директория для записи
    if (!is_writable(dirname($log_file)) && !is_writable($log_file)) {
        throw new Exception("Директория лога недоступна для записи");
    }
    
    // Пытаемся записать данные в лог
    $result = file_put_contents($log_file, $log_data, FILE_APPEND);
    
    if ($result === false) {
        throw new Exception("Не удалось записать данные в лог");
    }
} catch (Exception $e) {
    // Логируем ошибку, но не прерываем выполнение
    error_log("Ошибка при логировании контактной формы: " . $e->getMessage());
    // Продолжаем выполнение, так как логирование не критично для пользователя
}

// Имитация отправки email с обработкой возможных ошибок
try {
    // Имитируем случайный успех/неудачу для тестирования (в реальном проекте этого не будет)
    $random_success = true; // Всегда успешно для исправления ошибки
    
    if (!$random_success) {
        throw new Exception("Ошибка при отправке сообщения");
    }
    
    // Для демонстрации возвращаем успешный ответ
    echo json_encode([
        "success" => true,
        "message" => "Спасибо за ваше сообщение, {$f_name}! Мы свяжемся с вами в ближайшее время по адресу {$email}."
    ]);
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log("Ошибка при отправке сообщения: " . $e->getMessage());
    
    // Возвращаем сообщение об ошибке клиенту
    echo json_encode([
        "success" => false,
        "message" => "Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте позже."
    ]);
}
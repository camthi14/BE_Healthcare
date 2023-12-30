SET
  AUTOCOMMIT = OFF;

CREATE DATABASE IF NOT EXISTS `manager_clinic_booking_dev` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;

USE manager_clinic_booking_dev;

/**
 * =============================================
 * Table: Logs -- Ghi log
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(10) NOT NULL UNIQUE,
  `log_type` ENUM('errors', 'requests') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Logs_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Permissions - Quyền
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `alias` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Dinh danh vai tro',
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Permissions_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Roles - Vai trò
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Roles_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: RolePermissions - Vai trò có các quyền
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `RolePermissions` (
  `permission_id` INT NOT NULL,
  `role_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_RolePermissions_Permissions` FOREIGN KEY (`permission_id`) REFERENCES `Permissions` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_RolePermissions_Roles` FOREIGN KEY (`role_id`) REFERENCES `Roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_RolePermissions_id`(`permission_id`, `role_id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Owners - Chủ khách sạn
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Owners` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `display_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `email_verified_at` DATETIME DEFAULT NULL,
  `phone_number` VARCHAR(10) DEFAULT NULL,
  `phone_verified_at` DATETIME DEFAULT NULL,
  `remember_token` VARCHAR(255) DEFAULT NULL,
  `token_owner` VARCHAR(255) DEFAULT NULL,
  `photo` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'banned', 'retired') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Owners_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `Owners`
ADD
  IF NOT EXISTS `email_verify_token` VARCHAR(255) DEFAULT NULL;

/**
 * =============================================
 * Table: Owner_Infors - Thông tin chủ khách sạn
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `OwnerInfos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `owner_id` INT NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `desc` TEXT DEFAULT NULL,
  `gender` ENUM('MALE', 'FEMALE') DEFAULT 'MALE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_OwnerInfos_Owners` FOREIGN KEY (`owner_id`) REFERENCES `Owners` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_OwnerInfos_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Customer_Types - Loại Khách hàng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `PatientTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `PatientTypes`
ADD
  IF NOT EXISTS is_default BOOLEAN DEFAULT 0;

/**
 * =============================================
 * Table: Patients - Khách hàng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Patients` (
  `id` VARCHAR(32) NOT NULL,
  `patient_type_id` INT NOT NULL,
  `display_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `email_verified_at` DATETIME DEFAULT NULL,
  `phone_number` VARCHAR(10) DEFAULT NULL,
  `phone_verified_at` DATETIME DEFAULT NULL,
  `remember_token` VARCHAR(255) DEFAULT NULL,
  `photo` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Patients_Customer_Types` FOREIGN KEY (`patient_type_id`) REFERENCES `PatientTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Patients_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `Patients`
ADD
  IF NOT EXISTS `email_verify_token` VARCHAR(255) DEFAULT NULL;

ALTER TABLE
  `Patients`
ADD
  IF NOT EXISTS `otp_token` VARCHAR(255) DEFAULT NULL;

ALTER TABLE
  `Patients` DROP COLUMN IF EXISTS `username`;

ALTER TABLE
  `Patients`
MODIFY
  COLUMN `status` ENUM('active', 'inactive', 'waitting') DEFAULT 'waitting';
  
ALTER TABLE
  `Patients`
ADD IF NOT EXISTS `relationship` ENUM('me', 'mother', 'father', 'others', 'married_couple') DEFAULT 'me';

ALTER TABLE
  `Patients`
ADD IF NOT EXISTS `relatives_id` VARCHAR(32) DEFAULT NULL;

/**
 * =============================================
 * Table: Customer_Infos - Thông tin Khách hàng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `PatientInfos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `patient_id` VARCHAR(32) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `desc` TEXT DEFAULT NULL,
  `gender` ENUM('MALE', 'FEMALE') DEFAULT 'MALE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_PatientInfos_Patients` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_PatientInfos_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Employees - Nhân viên
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Employees` (
  `id` VARCHAR(32) NOT NULL,
  `display_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NULL,
  `email_verified_at` DATETIME NULL,
  `phone_number` VARCHAR(10) DEFAULT NULL,
  `phone_verified_at` DATETIME DEFAULT NULL,
  `remember_token` VARCHAR(255) DEFAULT NULL,
  `photo` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'banned', 'retired') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Employees_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `Employees`
ADD
  IF NOT EXISTS `email_verify_token` VARCHAR(255) DEFAULT NULL;

/**
 * =============================================
 * Table: Employee_Infors - Thông tin nhân viên
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `EmployeeInfos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` VARCHAR(32) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `desc` TEXT DEFAULT NULL,
  `gender` ENUM('MALE', 'FEMALE') DEFAULT 'MALE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Employee_Infos_Employees` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_EmployeeInfos_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Specialist - Chuyên khoa
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Specialists` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `photo` VARCHAR(255) NOT NULL,
  `time_chekup_avg` INT NOT NULL COMMENT 'Thoi gian kham trung binh 1 ca',
  `status` ENUM(
    'active',
    'inactive',
    'banned',
    'waitting',
    'reject'
  ) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Specialists_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `Specialists`
ADD
  IF NOT EXISTS `price` INT DEFAULT 100000 COMMENT 'Don Gia Goi Dich Vu' CHECK(`price` > 0);

/**
 * =============================================
 * Table: Qualified_Doctor - Trình độ bác sĩ.
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `QualifiedDoctors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Qualified_Doctor_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `QualifiedDoctors`
ADD
  COLUMN IF NOT EXISTS `character` VARCHAR(255) NOT NULL UNIQUE;

/**
 * =============================================
 * Table: Departments - Bộ phận - Phòng ban
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Departments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Positions - Chức vụ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Positions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `sub_num` VARCHAR(255) NOT NULL COMMENT 'Hệ số phụ cấp',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Doctors - Bác sĩ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Doctors` (
  `id` VARCHAR(32) NOT NULL,
  `facility_id` INT NOT NULL,
  `qualified_doctor_id` INT NOT NULL COMMENT 'Trinh Do Cua Bac Si',
  `speciality_id` INT NOT NULL COMMENT 'Chuyen Khoa Cua Bac Si',
  `display_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NULL,
  `email_verified_at` DATETIME NULL,
  `phone_number` VARCHAR(10) DEFAULT NULL,
  `phone_verified_at` DATETIME DEFAULT NULL,
  `remember_token` VARCHAR(255) DEFAULT NULL,
  `photo` TEXT DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'banned', 'retired') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Doctors_Qualified_Doctor_Id` FOREIGN KEY (`qualified_doctor_id`) REFERENCES `QualifiedDoctor` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Doctors_Specialist_Id` FOREIGN KEY (`speciality_id`) REFERENCES `Specialist` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Doctors_id`(`id`)
) ENGINE = InnoDB;

-- ALTER TABLE `Doctors` DROP COLUMN IF EXISTS `facility_id`;
-- ALTER TABLE `Doctors` DROP IF EXISTS FOREIGN KEY `fk_Doctors_Qualified_Doctor_Id`;
-- ALTER TABLE `Doctors` DROP IF EXISTS FOREIGN KEY `fk_Doctors_Specialist_Id`;
-- ALTER TABLE `Doctors` ADD CONSTRAINT `fk_Doctors_Qualified_Doctor_Id` FOREIGN KEY (`qualified_doctor_id`) REFERENCES `QualifiedDoctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
-- ALTER TABLE `Doctors` ADD CONSTRAINT `fk_Doctors_Specialist_Id` FOREIGN KEY (`speciality_id`) REFERENCES `Specialists` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
/**
 * =============================================
 * Table: Doctors_Infors - Thông tin bác sĩ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `DoctorsInfors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `doctor_id` VARCHAR(32) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `desc` TEXT DEFAULT NULL,
  `gender` ENUM('MALE', 'FEMALE') DEFAULT 'MALE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Doctors_Infors_Doctorss` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Doctors_Infors_id`(`id`, `doctor_id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Room - Phòng
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Rooms` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `equipment_id` INT NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `deleted_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Rooms_Equipment_Id` FOREIGN KEY (`equipment_id`) REFERENCES `Equipments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Room_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: ServiceTypes - Loại Dịch vụ gói khám
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ServiceTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `desc` VARCHAR(255) NOT NULL,
  `deleted_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_ServiceTypes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Services - Dịch vụ gói khám
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Services` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `service_type_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Services_Service_Types` FOREIGN KEY (`service_type_id`) REFERENCES `ServiceTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Services_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `Services`
ADD
  IF NOT EXISTS `photo` TEXT DEFAULT NULL;

ALTER TABLE
  `Services`
ADD
  IF NOT EXISTS `price` INT NOT NULL COMMENT 'Don Gia Goi Dich Vu' CHECK(`price` > 0);

ALTER TABLE
  `Services`
ADD
  IF NOT EXISTS `content` TEXT DEFAULT NULL;

/**
 * =============================================
 * Table: Units -- Đơn vị tính của thuốc
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Units` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `desc` VARCHAR(255) NOT NULL,
  `character` VARCHAR(255) NOT NULL UNIQUE,
  `deleted_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Units_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: SubclinicalTypes - Loại cận lâm sàng.
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `SubclinicalTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_SubclinicalTypes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Subclinicals - Cận lâm sàng.
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Subclinicals` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `subclinical_type_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `equipment_id` INT NOT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_SubclinicalTypes_Id` FOREIGN KEY (`subclinical_type_id`) REFERENCES `SubclinicalTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Equipment_Id` FOREIGN KEY (`equipment_id`) REFERENCES `Equipments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Room_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Subclinicals_id`(`id`)
) ENGINE = InnoDB;

-- ALTER TABLE `Subclinicals` ADD IF NOT EXISTS `price` TEXT DEFAULT NULL;
-- ALTER TABLE `Subclinicals` ADD IF NOT EXISTS `content` INT NOT NULL COMMENT 'Don Gia Goi CLS' CHECK(`price` > 0);
-- ALTER TABLE `Subclinicals` ADD IF NOT EXISTS `desc` VARCHAR(255) NOT NULL;
-- ALTER TABLE `Subclinicals` ADD IF NOT EXISTS `room_id` INT NOT NULL;
-- ALTER TABLE `Subclinicals` ADD IF NOT EXISTS `equipment_id` INT NOT NULL;
-- ALTER TABLE `Subclinicals` DROP FOREIGN KEY `fk_Equipment_Id`;
-- ALTER TABLE `Subclinicals` DROP COLUMN `equipment_id`;
-- ALTER TABLE `Subclinicals` ADD CONSTRAINT `fk_Equipment_Id` FOREIGN KEY (`equipment_id`) REFERENCES `Equipments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
-- ALTER TABLE `Subclinicals` ADD CONSTRAINT `fk_Room_Id` FOREIGN KEY (`room_id`) REFERENCES `Rooms` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
/**
 * =============================================
 * Table: Medicine_Types - Loại thuốc
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `MedicineTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_MedicineTypes_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Medicines - Thuốc
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Medicines` (
  `id` VARCHAR(16) NOT NULL,
  `medictine_type_id` INT NOT NULL,
  `unit_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `status` ENUM(
    'active',
    'inactive',
    'banned',
    'waiting',
    'reject'
  ) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Medicines_Medicine_Units` FOREIGN KEY (`unit_id`) REFERENCES `Units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Medicines_Medicine_Types` FOREIGN KEY (`medictine_type_id`) REFERENCES `MedicineTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Medicines_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Medicine_Details - Chi tiết thuốc
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `MedicineDetails` (
  `medicine_id` VARCHAR(16) NOT NULL,
  `quantity` INT NOT NULL COMMENT 'So Luong Thuoc' CHECK(`quantity` > 0),
  `price` INT NOT NULL COMMENT 'Don Gia Thuoc' CHECK(`price` > 0),
  `production_date` DATE NOT NULL COMMENT 'Ngay San Xuat',
  `drug_concentration` INT NOT NULL COMMENT 'Nong do thuoc',
  `expired_at` DATE NOT NULL COMMENT 'Han Su Dung / Ngay Het Han',
  `status` ENUM(
    'active',
    'inactive',
    'banned',
    'waiting',
    'reject'
  ) DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Medicine_Details_Medicine_Id` FOREIGN KEY (`medicine_id`) REFERENCES `Medicines` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_MedicineDetails_id`(`medicine_id`)
) ENGINE = InnoDB;

ALTER TABLE
  `MedicineDetails`
ADD
  IF NOT EXISTS `price_sell` INT NOT NULL COMMENT 'Gia Ban' CHECK(`price_sell` > 0);

ALTER TABLE
  `MedicineDetails`
ADD
  IF NOT EXISTS `ingredients` VARCHAR(255) NOT NULL COMMENT 'Thanh Phan Cua Thuoc';

/**
 * =============================================
 * Table: EquipmentTypes - Loại thiết bị
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `EquipmentTypes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_EquipmentTypes_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `EquipmentTypes`
ADD
  IF NOT EXISTS `deleted_at` DATETIME DEFAULT NULL;

/**
 * =============================================
 * Table: Equipments - Thiết bị
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Equipments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `equipment_type_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `desc` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Equipments_Equipment_Types` FOREIGN KEY (`equipment_type_id`) REFERENCES `EquipmentTypes` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Equipments_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `Equipments`
ADD
  IF NOT EXISTS `photo` TEXT DEFAULT NULL;

ALTER TABLE
  `Equipments`
ADD
  IF NOT EXISTS `deleted_at` DATETIME DEFAULT NULL;

/**
 * =============================================
 * Table: API KEY - Mã sử dụng chức năng.
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ApiKeys` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `patient_id` VARCHAR(32),
  `employee_id` VARCHAR(32),
  `owner_id` INT,
  `doctor_id` VARCHAR(32),
  `key` VARCHAR(255) NOT NULL UNIQUE,
  `permissions` ENUM('0000', '1111', '2222') DEFAULT '2222',
  `ip_address` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ApiKeys_Employees` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_ApiKeys_Patients` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_ApiKeys_Owners` FOREIGN KEY (`owner_id`) REFERENCES `Owners` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_ApiKeys_Doctors` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ApiKeys_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `ApiKeys`
MODIFY
  COLUMN `permissions` ENUM('0000', '1111', '2222', '3333') DEFAULT '3333';

/**
 * =============================================
 * Table: TokenPairs Ma su dung sau khi dang nhap
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `TokenPairs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `patient_id` VARCHAR(32),
  `employee_id` VARCHAR(32),
  `owner_id` INT,
  `doctor_id` VARCHAR(32),
  `public_key` TEXT NOT NULL,
  `private_key` TEXT NOT NULL,
  `refresh_token` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_TokenPairs_Employees` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_TokenPairs_Patients` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_TokenPairs_Owners` FOREIGN KEY (`owner_id`) REFERENCES `Owners` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_TokenPairs_Doctors` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_TokenPairs_id`(`id`)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS `RefreshTokensUsed` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key_id` INT NOT NULL,
  `refresh_token` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_RefreshTokensUsed_TokenPairs` FOREIGN KEY (`key_id`) REFERENCES `TokenPairs` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_RefreshTokensUsed_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Operations - Nhân viên hoạt động tại bộ phận có chức vụ và thời điểm nào. 
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Operations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `employee_id` VARCHAR(32),
  `doctor_id` VARCHAR(32),
  `department_id` INT NOT NULL,
  `position_id` INT NOT NULL,
  `deleted_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Operations_Employees` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Operations_Departments` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Operations_Positions` FOREIGN KEY (`position_id`) REFERENCES `Positions` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Operations_Doctors` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Operations_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Sessions_Checkup - Buổi khám bệnh
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `SessionsCheckups` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `time_start` TIME NOT NULL,
  `time_end` TIME NOT NULL,
  `desc` VARCHAR(255),
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_SessionsCheckups_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: ScheduleDoctors - Lịch khám bệnh của bác sĩ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ScheduleDoctors` (
  `id` VARCHAR(32) NOT NULL,
  `session_checkup_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `doctor_id` VARCHAR(32) NOT NULL,
  `status` ENUM('active', 'inactive', 'complete') DEFAULT 'inactive',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ScheduleDoctors_SessionsCheckups_Id` FOREIGN KEY (`session_checkup_id`) REFERENCES `SessionsCheckups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_ScheduleDoctors_Doctors_Id` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ScheduleDoctors_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: ScheduleDoctors - Lịch khám bệnh của bác sĩ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `HourObjects` (
  `id` VARCHAR(255) NOT NULL,
  `schedule_doctor_id` VARCHAR(32) NOT NULL,
  `time_start` VARCHAR(255) NOT NULL,
  `time_end` VARCHAR(255) NOT NULL,
  `is_remove` BOOLEAN NOT NULL,
  `is_booked` BOOLEAN NOT NULL,
  `is_cancel` BOOLEAN NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_HourObjects_SessionsCheckups_Id` FOREIGN KEY (`schedule_doctor_id`) REFERENCES `ScheduleDoctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_HourObjects_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Bookings - Khách hàng đặt lịch khám
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Bookings` (
  `id` VARCHAR(32) NOT NULL,
  `patient_id` VARCHAR(32) NOT NULL,
  `doctor_id` VARCHAR(32) NOT NULL,
  `hour_id` VARCHAR(255) NOT NULL,
  `date` DATE NOT NULL,
  `note` TEXT DEFAULT NULL,
  `reason` TEXT NOT NULL,
  `price` INT DEFAULT NULL,
  `actor_booking_type` VARCHAR(255) DEFAULT NULL COMMENT 'Nguoi dat',
  `actor_booking_value` VARCHAR(255) DEFAULT NULL COMMENT 'Ma So Nguoi Dat',
  `type_patient` ENUM('new', 're_examination') NOT NULL,
  `status` ENUM(
    'in_progress',
    'waiting',
    'completed',
    'paid',
    'canceled',
    'doctor_canceled'
  ) DEFAULT 'waiting',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Bookings_Patient_Id` FOREIGN KEY (`patient_id`) REFERENCES `Patients` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Bookings_Doctor_Id` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Bookings_Hour_Id` FOREIGN KEY (`hour_id`) REFERENCES `HourObjects` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Bookings_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `Bookings`
ADD
  IF NOT EXISTS `order` INT DEFAULT 0 COMMENT 'So thu tu';

/**
 * =============================================
 * Table: BookingsImages -- Ket qua hinh anh CLS
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `BookingsImages` (
  `id` VARCHAR(32) NOT NULL,
  `booking_id` VARCHAR(32) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `deleted_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_BookingsImages_Bookings_Id` FOREIGN KEY (`booking_id`) REFERENCES `Bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_BookingsImages_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: ExaminationCards - Phiếu khám
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ExaminationCards` (
  `id` VARCHAR(32) NOT NULL,
  `order` INT NOT NULL COMMENT 'So thu tu',
  `booking_id` VARCHAR(32) NOT NULL,
  `note` VARCHAR(255) NOT NULL,
  `status` ENUM(
    'in_progress',
    'complete',
    'waiting',
    'reject',
    'delay_results'
  ) DEFAULT 'waiting',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ExaminationCards_Booking_Id` FOREIGN KEY (`booking_id`) REFERENCES `Bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ExaminationCards_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `ExaminationCards`
ADD
  IF NOT EXISTS `artery` INT DEFAULT NULL COMMENT 'Mach (Lan/Phut)';

ALTER TABLE
  `ExaminationCards`
ADD
  IF NOT EXISTS `temperature` INT DEFAULT NULL COMMENT 'Nhiet do (Do C)';

ALTER TABLE
  `ExaminationCards`
ADD
  IF NOT EXISTS `spO2` INT DEFAULT NULL COMMENT 'spO2';

ALTER TABLE
  `ExaminationCards`
ADD
  IF NOT EXISTS `breathing_rate` INT DEFAULT NULL COMMENT 'Nhip Tho (Nhip/Phut)';

ALTER TABLE
  `ExaminationCards`
ADD
  IF NOT EXISTS `blood_pressure` INT DEFAULT NULL COMMENT 'Huyet ap (mmHg)';

ALTER TABLE
  `ExaminationCards`
ADD
  IF NOT EXISTS `is_use_service` BOOLEAN DEFAULT 0;

-- ALTER TABLE `ExaminationCards` DROP IF EXISTS `under_blood_pressure`;
ALTER TABLE
  `ExaminationCards`
ADD
  IF NOT EXISTS `under_blood_pressure` INT DEFAULT 0;

-- ALTER TABLE `ExaminationCards` DROP IF EXISTS `status`;
-- ALTER TABLE `ExaminationCards` DROP IF EXISTS `options`;
ALTER TABLE
  `ExaminationCards`
ADD
  IF NOT EXISTS `options` ENUM(
    'service',
    'subclinical',
    'doctor.service',
    'doctor.subclinical'
  ) DEFAULT 'service';

-- ALTER TABLE `ExaminationCards` ADD `status` ENUM('in_progress', 'complete', 'pending', 'reject', 'delay_results', 'examination') DEFAULT 'in_progress';
-- ALTER TABLE
--   `ExaminationCards`
-- MODIFY
--   `options` ENUM(
--     'service',
--     'subclinical',
--     'doctor.service',
--     'doctor.subclinical',
--     're_examination',
--     'doctor.re_examination'
--   ) DEFAULT 'service';

/**
 * =============================================
 * Table: ExaminationCardsDetails - Chi tiết Phiếu khám sử dụng dịch vụ
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ExaminationCardsDetails` (
  `id` VARCHAR(32) NOT NULL,
  `examination_card_id` VARCHAR(32) NOT NULL,
  `service_entity` VARCHAR(255) NOT NULL,
  `service_value` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ExaminationCardsDetails_Card_Id` FOREIGN KEY (`examination_card_id`) REFERENCES `ExaminationCards` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ExaminationCardsDetails_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE
  `ExaminationCardsDetails`
ADD
  IF NOT EXISTS `status` ENUM('required', 'finished', 'unfinished') DEFAULT 'required';

-- ALTER TABLE `ExaminationCardsDetails` ADD IF NOT EXISTS `doctor_id` VARCHAR(32) DEFAULT NULL;
-- ALTER TABLE `ExaminationCardsDetails` ADD CONSTRAINT `fk_ExaminationCardsDetails_Doctors_Id` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
/**
 * =============================================
 * Table: ServiceSubclinicals -- Dịch vụ gói khám - CLS
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ServiceSubclinicals` (
  `service_id` INT NOT NULL,
  `subclinical_id` INT NOT NULL,
  `deleted_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ServiceSubclinicals_Service_Id` FOREIGN KEY (`service_id`) REFERENCES `Services` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_ServiceSubclinicals_Subclinicals_Id` FOREIGN KEY (`subclinical_id`) REFERENCES `Subclinicals` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ServiceSubclinicals_id`(`service_id`, `subclinical_id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: ResultsDiagnosisSubclinicals -- Ket qua CLS
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ResultsDiagnosisSubclinicals` (
  `id` VARCHAR(32) NOT NULL,
  `exam_card_details_id` VARCHAR(32) NOT NULL,
  `subclinical_id` INT NOT NULL,
  `rate` TEXT NOT NULL,
  `results` TEXT NOT NULL,
  `deleted_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ResultsDiagnosisSubclinicals_ExaminationCardsDetails_Id` FOREIGN KEY (`exam_card_details_id`) REFERENCES `ExaminationCardsDetails` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ResultsDiagnosisSubclinicals_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: ResultsImages -- Ket qua hinh anh CLS
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `ResultsImages` (
  `id` VARCHAR(32) NOT NULL,
  `result_id` VARCHAR(32) NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `deleted_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ResultsImages_ResultsDiagnosisSubclinicals_Id` FOREIGN KEY (`result_id`) REFERENCES `ResultsDiagnosisSubclinicals` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_ResultsImages_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Bills - Hóa đơn thanh toán
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Bills` (
  `id` VARCHAR(32) NOT NULL,
  `employee_id` VARCHAR(32) NOT NULL,
  `booking_id` VARCHAR(32) NOT NULL,
  `examination_card_id` VARCHAR(32) NOT NULL,
  `total_price` INT NOT NULL,
  `payment_for` ENUM('medicine', 'cost_exam', 'cost_cls') NOT NULL,
  `deposit` INT DEFAULT NULL COMMENT 'tien tra truoc',
  `change` INT DEFAULT NULL COMMENT 'tien thua',
  `price_received` INT DEFAULT NULL COMMENT 'tien da nhan tu khach',
  `note` TEXT DEFAULT NULL,
  `status` ENUM('paid', 'unpaid', 'partially_paid', 'others') NOT NULL COMMENT 'trang thai',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Bills_Bookings_Id` FOREIGN KEY (`booking_id`) REFERENCES `Bookings` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Bills_Employee_Id` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Bills_ExaminationCards_Id` FOREIGN KEY (`examination_card_id`) REFERENCES `ExaminationCards` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Bills_id`(`id`)
) ENGINE = InnoDB;

/**
 * =============================================
 * Table: Prescriptions - Toa thuốc
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Prescriptions` (
  `id` VARCHAR(32) NOT NULL,
  `exam_card_id` VARCHAR(32) NOT NULL,
  `employee_id` VARCHAR(32) DEFAULT NULL,
  `doctor_id` VARCHAR(32) NOT NULL,
  `diagnosis` TEXT NOT NULl COMMENT 'chuan doan',
  `note` TEXT DEFAULT NULL COMMENT 'Loi dan',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_Prescriptions_Exam_Id` FOREIGN KEY (`exam_card_id`) REFERENCES `ExaminationCards` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Prescriptions_Employee_Id` FOREIGN KEY (`employee_id`) REFERENCES `Employees` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_Prescriptions_Doctors_Id` FOREIGN KEY (`doctor_id`) REFERENCES `Doctors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_Prescriptions_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `Prescriptions` ADD IF NOT EXISTS `quantity_re_exam` INT DEFAULT NULL;
ALTER TABLE `Prescriptions` ADD IF NOT EXISTS `date_re_exam` DATE DEFAULT NULL;

/**
 * =============================================
 * Table: PrescriptionsDetails - Chi tiết Toa thuốc
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `PrescriptionsDetails` (
  `id` VARCHAR(32) NOT NULL,
  `prescriptions_id` VARCHAR(32) NOT NULL,
  `medicine_id` VARCHAR(16) NULL NULL,
  `quantity_ordered` INT NULL NULL,
  `note` TEXT DEFAULT NULL COMMENT 'Huong dan lan su dung, ...',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_PrescriptionsDetails_Prescriptions_Id` FOREIGN KEY (`prescriptions_id`) REFERENCES `Prescriptions` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `fk_PrescriptionsDetails_Medicines_Id` FOREIGN KEY (`medicine_id`) REFERENCES `Medicines` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  PRIMARY KEY `pk_PrescriptionsDetails_id`(`id`)
) ENGINE = InnoDB;


ALTER TABLE `PrescriptionsDetails` ADD IF NOT EXISTS `amount_use_in_day` ENUM('1', '2', '3') NOT NULL;
ALTER TABLE `PrescriptionsDetails` ADD IF NOT EXISTS `amount_of_medication_per_session` INT NOT NULL;
ALTER TABLE `PrescriptionsDetails` ADD IF NOT EXISTS `session` VARCHAR(255) NOT NULL;

/**
 * =============================================
 * Table: Notifications - Thông báo
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `Notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `actor_type` ENUM('patient', 'owner', 'doctor', 'employee') NOT NULL,
  `user_id` INT NOT NULL,
  `is_read` BOOLEAN DEFAULT 0,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `notification_type` VARCHAR(255),
  `entity_name` VARCHAR(255) NOT NULL,
  `entity_id` VARCHAR(255) NOT NULL,
  `is_system` BOOLEAN NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_Notifications_id`(`id`)
) ENGINE = InnoDB;


ALTER TABLE `Notifications` MODIFY `user_id` VARCHAR(32) NOT NULL;


/**
 * =============================================
 * Table: SaveExpoPushTokens - Lưu lại mã id device
 * =============================================
 */
CREATE TABLE IF NOT EXISTS `SaveExpoPushTokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `expo_push_token` VARCHAR(255),
  `user_id` INT DEFAULT NULL,
  `actor_type` ENUM('patient', 'owner', 'doctor', 'employee') DEFAULT 'patient',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY `pk_PushTokens_id`(`id`)
) ENGINE = InnoDB;

ALTER TABLE `SaveExpoPushTokens` MODIFY `user_id` VARCHAR(32) NOT NULL;
# BÁO CÁO KIỂM TOÁN TOÀN DIỆN MÃ NGUỒN BACKEND (AUDIT REPORT)
## DỰ ÁN: PRN212 - AI STUDY HUB
**Môi trường công nghệ:** .NET 10 (C# 13), ASP.NET Core WebAPI, Entity Framework Core 10, SQL Server  
**Phạm vi kiểm toán:** Toàn bộ thư mục `src/` gồm 4 tầng kiến trúc:
- `src/PRN212.AIStudyHub.Domain`
- `src/PRN212.AIStudyHub.Application`
- `src/PRN212.AIStudyHub.Infrastructure`
- `src/PRN212.AIStudyHub.WebAPI`

---

## MỤC LỤC
1. [TỔNG QUAN KIỂM TOÁN VÀ MA TRẬN PHÁT HIỆN](#1-tổng-quan-kiểm-toán-và-ma-trận-phát-hiện)
2. [NHÓM 1: BẢO MẬT VÀ QUẢN LÝ CẤU HÌNH (SECURITY & CONFIGURATION)](#nhóm-1-bảo-mật-và-quản-lý-cấu-hình-security--configuration)
   - [SEC-01: Lộ lọt thông tin xác thực nhạy cảm và Hardcoded Secrets trong appsettings.json](#sec-01-lộ-lọt-thông-tin-xác-thực-nhạy-cảm-và-hardcoded-secrets-trong-appsettingsjson)
   - [SEC-02: Lỗ hổng Leo thang đặc quyền (Privilege Escalation) qua API Đăng ký tài khoản](#sec-02-lỗ-hổng-leo-thang-đặc-quyền-privilege-escalation-qua-api-đăng-ký-tài-khoản)
   - [SEC-03: Sử dụng bộ sinh số giả ngẫu nhiên không an toàn (System.Random) để tạo mã OTP](#sec-03-sử-dụng-bộ-sinh-số-giả-ngẫu-nhiên-không-an-toàn-systemrandom-để-tạo-mã-otp)
   - [SEC-04: Token Revocation thất bại trong môi trường phân tán và bỏ quên thu hồi Refresh Token khi Logout](#sec-04-token-revocation-thất-bại-trong-môi-trường-phân-tán-và-bỏ-quên-thu-hồi-refresh-token-khi-logout)
   - [SEC-05: Rủi ro mạo danh ủy quyền (Token Substitution) do thiếu Purpose Isolation của Temporary Token](#sec-05-rủi-ro-mạo-danh-ủy-quyền-token-substitution-do-thiếu-purpose-isolation-của-temporary-token)
   - [SEC-06: Lỗ hổng Brute-force OTP do thiếu Rate Limiting và thiếu cơ chế giới hạn số lần thử](#sec-06-lỗ-hổng-brute-force-otp-do-thiếu-rate-limiting-và-thiếu-cơ-chế-giới-hạn-số-lần-thử)
   - [SEC-07: Thiếu phân quyền vai trò (Broken Access Control) trên endpoint tạo môn học](#sec-07-thiếu-phân-quyền-vai-trò-broken-access-control-trên-endpoint-tạo-môn-học)
   - [SEC-08: Nguy cơ Server-Side Request Forgery (SSRF) trong CloudinaryStorageService.DownloadFileStream](#sec-08-nguy-cơ-server-side-request-forgery-ssrf-trong-cloudinarystorageservicedownloadfilestream)
   - [SEC-09: Thiếu cấu hình chính sách CORS trong WebAPI Pipeline](#sec-09-thiếu-cấu-hình-chính-sách-cors-trong-webapi-pipeline)
   - [SEC-10: Lỗ hổng Tải tệp không an toàn (Unrestricted File Upload) do thiếu Magic Bytes, thiếu lọc Path Traversal & Rò rỉ tài nguyên Cloudinary](#sec-10-lỗ-hổng-tải-tệp-không-an-toàn-unrestricted-file-upload-do-thiếu-magic-bytes-thiếu-lọc-path-traversal--rò-rỉ-tài-nguyên-cloudinary)
   - [SEC-11: Lỗ hổng Phân quyền Quản trị viên Không nhất quán (Broken Admin Moderation) trong Document Management](#sec-11-lỗ-hổng-phân-quyền-quản-trị-viên-không-nhất-quán-broken-admin-moderation-trong-document-management)
   - [SEC-12: Lỗ hổng Liệt kê Tài khoản (Account / User Enumeration) trong API Quên mật khẩu](#sec-12-lỗ-hổng-liệt-kê-tài-khoản-account--user-enumeration-trong-api-quên-mật-khẩu)
3. [NHÓM 2: CODE SMELLS VÀ KIẾN TRÚC HỆ THỐNG (CODE SMELLS & ARCHITECTURE)](#nhóm-2-code-smells-và-kiến-trúc-hệ-thống-code-smells--architecture)
   - [ARC-01: Vi phạm Clean Architecture - EmailService nằm ở Application và dùng SmtpClient lỗi thời](#arc-01-vi-phạm-clean-architecture---emailservice-nằm-ở-application-và-dùng-smtpclient-lỗi-thời)
   - [ARC-02: Thiếu cấu hình EmailSettings trong file cấu hình gây InvalidOperationException tại runtime](#arc-02-thiếu-cấu-hình-emailsettings-trong-file-cấu-hình-gây-invalidoperationexception-tại-runtime)
   - [ARC-03: Lệch tên cấu hình JWT (ExpiryMinutes vs ExpiryInMinutes) làm vô hiệu hóa cài đặt Token Lifetime](#arc-03-lệch-tên-cấu-hình-jwt-expiryminutes-vs-expiryinminutes-làm-vô-hiệu-hóa-cài-đặt-token-lifetime)
   - [ARC-04: Socket Exhaustion do khởi tạo new HttpClient() thủ công & Quản lý vòng đời Stream chưa an toàn](#arc-04-socket-exhaustion-do-khởi-tạo-new-httpclient-thủ-công--quản-lý-vòng-đời-stream-chưa-an-toàn)
   - [ARC-05: Exception Handling Anti-Pattern - Map nhầm InvalidOperationException thành 400 Bad Request](#arc-05-exception-handling-anti-pattern---map-nhầm-invalidoperationexception-thành-400-bad-request)
   - [ARC-06: Chống chỉ định EF Core - Lạm dụng hàm .ToLower() trong biểu thức LINQ Where](#arc-06-chống-chỉ-định-ef-core---lạm-dụng-hàm-tolower-trong-biểu-thức-linq-where)
   - [ARC-07: Lạm dụng .Include() dư thừa khi kết hợp với LINQ Projection .Select()](#arc-07-lạm-dụng-include-dư-thừa-khi-kết-hợp-với-linq-projection-select)
   - [ARC-08: Thiếu Global Query Filter cho Soft Delete trên Entity Document](#arc-08-thiếu-global-query-filter-cho-soft-delete-trên-entity-document)
   - [ARC-09: Bỏ rơi CancellationToken trong phương thức bất đồng bộ CloudinaryStorageService.UploadRawFile](#arc-09-bỏ-rơi-cancellationtoken-trong-phương-thức-bất-đồng-bộ-cloudinarystorageserviceuploadrawfile)
   - [ARC-10: Nuốt ngoại lệ (Swallowed Exception) và sử dụng Console.WriteLine thay vì ILogger](#arc-10-nuốt-ngoại-lệ-swallowed-exception-và-sử-dụng-consolewriteline-thay-vì-ilogger)
   - [ARC-11: Naming Convention không nhất quán và Anemic Domain Model trong Domain Entities](#arc-11-naming-convention-không-nhất-quán-và-anemic-domain-model-trong-domain-entities)
   - [ARC-12: Tính năng Token Refresh bị bỏ hoang (Dead Feature) & Hardcoded Token Lifetime trong AuthResponse](#arc-12-tính-năng-token-refresh-bị-bỏ-hoang-dead-feature--hardcoded-token-lifetime-trong-authresponse)
   - [ARC-13: Lỗi lệch khớp Case-Sensitive trong Cache Key & Thiếu chuẩn hóa Email](#arc-13-lỗi-lệch-khớp-case-sensitive-trong-cache-key--thiếu-chuẩn-hóa-email)
   - [ARC-14: Thiếu Quản trị Giao dịch Đa bước (Missing Database Transactions & Non-Atomic Operations)](#arc-14-thiếu-quản-trị-giao-dịch-đa-bước-missing-database-transactions--non-atomic-operations)
   - [ARC-15: Xung đột Không gian Khóa Bộ nhớ đệm (Cache Key Collision & Type Confusion) giữa Đăng ký và Quên mật khẩu](#arc-15-xung-đột-không-gian-khóa-bộ-nhớ-đệm-cache-key-collision--type-confusion-giữa-đăng-ký-và-quên-mật-khẩu)
   - [ARC-16: Nguy cơ Replay Token Tạm thời (Unprotected Replay of Temporary Google Onboarding Token)](#arc-16-nguy-cơ-replay-token-tạm-thời-unprotected-replay-of-temporary-google-onboarding-token)
4. [NHÓM 3: CODE DƯ THỪA VÀ TỐI ƯU HÓA HIỆU NĂNG (DEAD CODE & OPTIMIZATION)](#nhóm-3-code-dư-thừa-và-tối-ưu-hóa-hiệu-năng-dead-code--optimization)
   - [OPT-01: Gói thư viện phụ thuộc dư thừa và không tương thích trong PRN212.AIStudyHub.Application.csproj](#opt-01-gói-thư-viện-phụ-thuộc-dư-thừa-và-không-tương-thích-trong-prn212aistudyhubapplicationcsproj)
   - [OPT-02: Dead Code - Lớp GoogleUserInfo.cs bị bỏ hoang do parse JSON thủ công](#opt-02-dead-code---lớp-googleuserinfocs-bị-bỏ-hoang-do-parse-json-thủ-công)
   - [OPT-03: Cấp phát bộ nhớ thừa thãi do khởi tạo JsonSerializerOptions liên tục trong Middleware](#opt-03-cấp-phát-bộ-nhớ-thừa-thãi-do-khởi-tạo-jsonserializeroptions-liên-tục-trong-middleware)
   - [OPT-04: Regex Compilation Overhead và xung đột từ chối domain kiểm thử hợp lệ](#opt-04-regex-compilation-overhead-và-xung-đột-từ-chối-domain-kiểm-thử-hợp-lệ)
   - [OPT-05: Trùng lặp code khởi tạo DocumentResponseDto (6 lần lặp) trong DocumentService](#opt-05-trùng-lặp-code-khởi-tạo-documentresponsedto-6-lần-lặp-trong-documentservice)
   - [OPT-06: Wrapper Class thừa AistudyHubDbContext.Custom.cs do scaffold DbSet số ít](#opt-06-wrapper-class-thừa-aistudyhubdbcontextcustomcs-do-scaffold-dbset-số-ít)
   - [OPT-07: Thiếu phân trang và cạn kiệt bộ nhớ tiềm ẩn trong API GetAllSubjects](#opt-07-thiếu-phân-trang-và-cạn-kiệt-bộ-nhớ-tiềm-ẩn-trong-api-getallsubjects)
   - [OPT-08: Nghẽn băng thông kép và thắt nút cổ chai máy chủ khi tải tài liệu (Double Bandwidth Proxying Bottleneck)](#opt-08-nghẽn-băng-thông-kép-và-thắt-nút-cổ-chai-máy-chủ-khi-tải-tài-liệu-double-bandwidth-proxying-bottleneck)
5. [LỘ TRÌNH VÀ HƯỚNG DẪN KHẮC PHỤC (REMEDIATION ROADMAP)](#5-lộ-trình-và-hướng-dẫn-khắc-phục-remediation-roadmap)
6. [HƯỚNG DẪN CẤU HÌNH VÀ STATIC ANALYSIS AUTOMATION](#6-hướng-dẫn-cấu-hình-và-static-analysis-automation)

---

## 1. TỔNG QUAN KIỂM TOÁN VÀ MA TRẬN PHÁT HIỆN

### 1.1 Mục tiêu kiểm toán
Đánh giá toàn diện mã nguồn 4 tầng thuộc thư mục `src/` nhằm phát hiện các rủi ro bảo mật (Vulnerabilities), vi phạm kiến trúc (Architecture Smells), các anti-patterns trong lập trình C# 13/.NET 10 và các đoạn mã/dependencies dư thừa.

### 1.2 Thống kê số lượng phát hiện
Sau đợt rà soát độc lập chuyên sâu vòng 2 (Adversarial Review Round 2), tổng cộng phát hiện **36 vấn đề kỹ thuật chuyên sâu** (mở rộng từ 26 phát hiện của đợt 1 và bổ sung thêm các lỗ hổng bị bỏ sót ở đợt trước):

| Nhóm vấn đề | Critical | High | Medium | Low | Tổng |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Nhóm 1: Bảo mật & Quản lý Cấu hình** | 3 | 6 | 3 | 0 | **12** |
| **Nhóm 2: Code Smells & Kiến trúc Hệ thống** | 0 | 6 | 9 | 1 | **16** |
| **Nhóm 3: Code Dư thừa & Tối ưu hóa** | 0 | 1 | 5 | 2 | **8** |
| **TỔNG CỘNG** | **3** | **13** | **17** | **3** | **36** |

### 1.3 Ma trận phân bổ theo tầng kiến trúc
- **PRN212.AIStudyHub.WebAPI**: SEC-01, SEC-04, SEC-05, SEC-07, SEC-09, SEC-10, SEC-11, ARC-02, ARC-03, ARC-05, ARC-12, OPT-03, OPT-04, OPT-07, OPT-08.
- **PRN212.AIStudyHub.Application**: SEC-02, SEC-03, SEC-06, SEC-10, SEC-11, SEC-12, ARC-01, ARC-02, ARC-04, ARC-06, ARC-07, ARC-10, ARC-12, ARC-13, ARC-14, ARC-15, ARC-16, OPT-01, OPT-02, OPT-04, OPT-05, OPT-07, OPT-08.
- **PRN212.AIStudyHub.Infrastructure**: SEC-05, SEC-08, ARC-01, ARC-03, ARC-04, ARC-08, ARC-09, OPT-06.
- **PRN212.AIStudyHub.Domain**: ARC-08, ARC-11, ARC-12.

---

## NHÓM 1: BẢO MẬT VÀ QUẢN LÝ CẤU HÌNH (SECURITY & CONFIGURATION)

### SEC-01: Lộ lọt thông tin xác thực nhạy cảm và Hardcoded Secrets trong appsettings.json
- **Mức độ nghiêm trọng:** `Critical`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.WebAPI/appsettings.json` (Dòng 10, 12-16, 18-23)
- **Nguyên nhân:**
  Tệp `appsettings.json` được theo dõi bởi Git chứa trực tiếp các thông tin bí mật thực tế của môi trường:
  - Database Connection String với tài khoản `sa` và mật khẩu `12345`.
  - Toàn bộ thông tin tài khoản Cloudinary đang hoạt động (`CloudName`: "rnzwm1xa", `ApiKey`: "911266614553236", `ApiSecret`: "VohQcjBvWwi7SJy7_p3hetniqQ8").
  - Khóa bí mật JWT (`Secret`: "xEvC4PWemRbRNHUShwerxymZ1YezpAR5MIla/KBQjwC3VNJ2nwPiJ3IZ/aNzAooo").
- **Hậu quả tiềm ẩn:**
  Bất kỳ ai có quyền truy cập vào kho mã nguồn (hoặc nếu repository bị lộ) đều có thể kiểm soát toàn bộ tài nguyên Cloudinary, giải mã và giả mạo chữ ký JWT để mạo danh bất kỳ tài khoản nào (bao gồm Admin), hoặc tấn công trực tiếp vào cơ sở dữ liệu.
- **Hướng dẫn khắc phục:**
  1. Lập tức thu hồi (Revoke/Rotate) API Key/Secret trên bảng điều khiển Cloudinary.
  2. Tạo mới JWT Secret Key có độ dài tối thiểu 256 bits (32 bytes ngẫu nhiên).
  3. Xóa bỏ các giá trị thật trong `appsettings.json`, chỉ lưu các chuỗi placeholder/template.
  4. Sử dụng .NET Secret Manager (`dotnet user-secrets`) cho môi trường Development cục bộ và Biến môi trường (Environment Variables) hoặc Azure Key Vault trên Staging/Production.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.WebAPI/appsettings.json`):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=AIStudyHubDB;User Id=sa;Password=12345;TrustServerCertificate=True;Encrypt=False;"
  },
  "CloudinarySettings": {
    "CloudName": "rnzwm1xa",
    "ApiKey": "911266614553236",
    "ApiSecret": "VohQcjBvWwi7SJy7_p3hetniqQ8",
    "Folder": "ai-study-hub/documents"
  },
  "JwtSettings": {
    "Secret": "xEvC4PWemRbRNHUShwerxymZ1YezpAR5MIla/KBQjwC3VNJ2nwPiJ3IZ/aNzAooo",
    "Issuer": "PRN212.AIStudyHub",
    "Audience": "PRN212.AIStudyHub.Client",
    "ExpiryInMinutes": 60
  }
}
```

**After (`src/PRN212.AIStudyHub.WebAPI/appsettings.json`):**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=AIStudyHubDB;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "CloudinarySettings": {
    "CloudName": "YOUR_CLOUDINARY_CLOUD_NAME",
    "ApiKey": "YOUR_CLOUDINARY_API_KEY",
    "ApiSecret": "YOUR_CLOUDINARY_API_SECRET",
    "Folder": "ai-study-hub/documents"
  },
  "JwtSettings": {
    "Secret": "YOUR_CRYPTOGRAPHICALLY_SECURE_JWT_SECRET_KEY_MINIMUM_32_BYTES",
    "Issuer": "PRN212.AIStudyHub",
    "Audience": "PRN212.AIStudyHub.Client",
    "ExpiryInMinutes": 60
  },
  "EmailSettings": {
    "SmtpServer": "smtp.gmail.com",
    "SmtpPort": 587,
    "SenderEmail": "YOUR_EMAIL@domain.com",
    "SenderPassword": "YOUR_SMTP_APP_PASSWORD",
    "SenderName": "AI Study Hub Support",
    "EnableSsl": true
  },
  "Google": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID"
  }
}
```

---

### SEC-02: Lỗ hổng Leo thang đặc quyền (Privilege Escalation) qua API Đăng ký tài khoản
- **Mức độ nghiêm trọng:** `Critical`
- **Vị trí tệp:** 
  - `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 147)
  - `src/PRN212.AIStudyHub.Application/DTOs/Auth/RegisterRequest.cs` (Dòng 3)
- **Nguyên nhân:**
  Trong `RegisterRequest`, client được phép gửi chuỗi `Role`:
  ```csharp
  public record RegisterRequest(string Email, string Password, string ConfirmPassword, string FirstName, string LastName, string Role);
  ```
  Trong khi đó, phương thức `AuthService.Register` không kiểm tra giá trị `Role`. Khi người dùng xác thực OTP trong `AuthService.VerifyOtp`:
  ```csharp
  Role = registerRequest.Role ?? "Student",
  ```
  Hệ thống gán trực tiếp vai trò do client cung cấp vào cơ sở dữ liệu.
- **Hậu quả tiềm ẩn:**
  Bất kỳ kẻ tấn công nào cũng có thể gửi yêu cầu đăng ký với `{ "Role": "Admin" }`. Sau khi xác thực OTP, tài khoản được tạo sẽ sở hữu đặc quyền `Admin` cao nhất trong hệ thống, cho phép chỉnh sửa môn học, xóa tài liệu và truy cập các API quản trị.
- **Hướng dẫn khắc phục:**
  1. Loại bỏ hoàn toàn trường `Role` khỏi `RegisterRequest` công khai hoặc đặt mặc định bắt buộc là `"Student"`.
  2. Nếu hệ thống cho phép đăng ký tài khoản Giảng viên (`Lecturer`), chỉ chấp nhận danh sách whitelist hợp lệ (`"Student"`, `"Lecturer"`). Tuyệt đối không cho phép đăng ký vai trò `"Admin"`. Việc cấp quyền `Admin` phải qua luồng quản trị viên nội bộ (Internal Seeding hoặc SuperAdmin).

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
AppUser newUser = new AppUser
{
  Email = registerRequest.Email,
  PasswordHash = passwordHasher.HashPassword(registerRequest.Password),
  FirstName = registerRequest.FirstName,
  LastName = registerRequest.LastName,
  Role = registerRequest.Role ?? "Student", // LỖ HỔNG: Kẻ tấn công gửi "Admin"
  IsActive = true,
};
```

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
// Chuẩn hóa và bảo vệ vai trò người dùng khi đăng ký công khai
static string SanitizeRole(string? requestedRole)
{
    return requestedRole?.Trim().ToLowerInvariant() switch
    {
        "lecturer" => "Lecturer",
        _ => "Student" // Mặc định luôn là Student, nghiêm cấm nhận Admin từ công khai
    };
}

AppUser newUser = new AppUser
{
    Email = registerRequest.Email.Trim().ToLowerInvariant(),
    PasswordHash = passwordHasher.HashPassword(registerRequest.Password),
    FirstName = registerRequest.FirstName.Trim(),
    LastName = registerRequest.LastName.Trim(),
    Role = SanitizeRole(registerRequest.Role),
    IsActive = true,
    CreatedAt = DateTime.UtcNow
};
```

---

### SEC-03: Sử dụng bộ sinh số giả ngẫu nhiên không an toàn (System.Random) để tạo mã OTP
- **Mức độ nghiêm trọng:** `Critical`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 74, Dòng 330)
- **Nguyên nhân:**
  Cả hai luồng tạo OTP đăng ký và quên mật khẩu đều dùng:
  ```csharp
  var otp = new Random().Next(100000, 999999).ToString();
  ```
  `System.Random` sử dụng thuật toán PRNG dựa trên Linear Congruential Generator có tính xác định (deterministic) và phụ thuộc vào `Environment.TickCount`. Đồng thời `Next(100000, 999999)` có cận trên exclusive, khiến số `999999` không bao giờ được sinh ra.
- **Hậu quả tiềm ẩn:**
  Kẻ tấn công có thể dễ dàng dự đoán mã OTP tiếp theo nếu biết thời điểm request được gửi đi hoặc quan sát một vài giá trị OTP sinh ra trước đó, từ đó chiếm đoạt tài khoản người dùng hoặc kích hoạt trái phép quy trình đặt lại mật khẩu.
- **Hướng dẫn khắc phục:**
  Sử dụng `RandomNumberGenerator.GetInt32(100000, 1000000)` từ namespace `System.Security.Cryptography` – chuẩn mã hóa mật mã học an toàn (CSPRNG) của .NET.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
var otp = new Random().Next(100000, 999999).ToString();
```

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
// Sử dụng bộ sinh số ngẫu nhiên an toàn tuyệt đối về mặt mật mã học (CSPRNG)
var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
```

---

### SEC-04: Token Revocation thất bại trong môi trường phân tán và bỏ quên thu hồi Refresh Token khi Logout
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.WebAPI/Controllers/AuthController.cs` (Dòng 124-126)
  - `src/PRN212.AIStudyHub.WebAPI/Program.cs` (Dòng 74-84)
- **Nguyên nhân:**
  1. **In-Memory Cache Blacklist:** Khi gọi `/api/v1/auth/logout`, token được lưu vào `IMemoryCache`: `memoryCache.Set($"Blacklist_{authToken}", true, cacheOptions);`. `IMemoryCache` chỉ nằm trong bộ nhớ RAM của một tiến trình WebAPI duy nhất.
  2. **Bỏ quên thu hồi Refresh Token:** Bảng cơ sở dữ liệu `RefreshToken` có cột `IsRevoked`, nhưng API `Logout` không hề thực hiện câu lệnh cập nhật `IsRevoked = true` cho RefreshToken của người dùng đó trong DB.
  3. **Lãng phí RAM:** Toàn bộ chuỗi JWT thô (500–1000 ký tự) được dùng làm Cache Key thay vì dùng định danh `jti` (JWT ID).
- **Hậu quả tiềm ẩn:**
  - Khi scale hệ thống lên 2 hoặc nhiều replicas (Docker Swarm/Kubernetes/Load Balancer), người dùng logout trên Server 1 nhưng request tiếp theo gửi tới Server 2 thì token vẫn hoàn toàn hợp lệ!
  - RefreshToken trong database không bị thu hồi, tồn tại vĩnh viễn đến khi hết hạn (7 ngày).
- **Hướng dẫn khắc phục:**
  1. Thêm Claim `JwtRegisteredClaimNames.Jti` vào Access Token khi sinh ra.
  2. Chuyển cơ chế Blacklist sang `IDistributedCache` (Redis) để đồng bộ giữa các nodes.
  3. Trong hàm `Logout`, đánh dấu `IsRevoked = true` cho toàn bộ RefreshToken còn hiệu lực của người dùng trong DbContext.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.WebAPI/Controllers/AuthController.cs`):**
```csharp
[HttpPost("logout")]
[Authorize]
public IActionResult Logout()
{
    var authHeader = Request.Headers.Authorization.ToString();
    var authToken = authHeader["Bearer ".Length..].Trim();
    var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromHours(1));
    memoryCache.Set($"Blacklist_{authToken}", true, cacheOptions);
    return Ok(ApiResponse.SuccessResponse("Logout successfully."));
}
```

// 1. Trong IAuthService & AuthService:
public async Task LogoutAsync(Guid userId, string token, CancellationToken cancellationToken)
{
    // Thu hồi toàn bộ RefreshToken còn hiệu lực của người dùng trong DB
    var activeRefreshTokens = await context.RefreshTokens
        .Where(rt => rt.UserId == userId && !rt.IsRevoked && rt.ExpiresAt > DateTime.UtcNow)
        .ToListAsync(cancellationToken);

    foreach (var rt in activeRefreshTokens)
    {
        rt.IsRevoked = true;
    }
    await context.SaveChangesAsync(cancellationToken);

    // Trích xuất JTI hoặc băm Token để lưu Blacklist trong Redis (IDistributedCache)
    var handler = new JwtSecurityTokenHandler();
    if (handler.CanReadToken(token))
    {
        var jwtToken = handler.ReadJwtToken(token);
        var jti = jwtToken.Id;
        var validTo = jwtToken.ValidTo;
        var remainingLifetime = validTo - DateTime.UtcNow;

        if (remainingLifetime > TimeSpan.Zero && !string.IsNullOrEmpty(jti))
        {
            await distributedCache.SetStringAsync(
                $"blacklist:{jti}", 
                "revoked", 
                new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = remainingLifetime }, 
                cancellationToken);
        }
    }
}

// 2. Trong src/PRN212.AIStudyHub.WebAPI/Controllers/AuthController.cs:
[HttpPost("logout")]
[Authorize]
[ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
public async Task<IActionResult> Logout(CancellationToken cancellationToken)
{
    var authHeader = Request.Headers.Authorization.ToString();
    var authToken = authHeader["Bearer ".Length..].Trim();
    await authService.LogoutAsync(CurrentUserId, authToken, cancellationToken);
    return Ok(ApiResponse.SuccessResponse("Logout successfully."));
}
```

---

### SEC-05: Rủi ro mạo danh ủy quyền (Token Substitution) do thiếu Purpose Isolation của Temporary Token
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Infrastructure/Security/JwtTokenGenerator.cs` (Dòng 50-82)
  - `src/PRN212.AIStudyHub.WebAPI/Program.cs` (Dòng 58-68)
- **Nguyên nhân:**
  Phương thức `GenerateTemporaryToken` cấp phát token cho người dùng Google chưa hoàn tất đăng ký. Token này được ký bởi cùng Secret Key, cùng Issuer và cùng Audience với Access Token thông thường. Trong pipeline xác thực tại `Program.cs`, middleware chỉ kiểm tra chữ ký và hạn dùng mà không xác thực `Purpose`.
- **Hậu quả tiềm ẩn:**
  Nếu một controller hoặc action chỉ gắn `[Authorize]` mà không gọi phương thức `CurrentUserId` (ví dụ `GET /api/v1/subjects`), thì người dùng đang cầm Temporary Token (chưa hoàn tất đăng ký tài khoản, chưa chọn Role) vẫn có thể truy cập được các tài nguyên được bảo vệ.
- **Hướng dẫn khắc phục:**
  1. Thêm một authentication scheme riêng (ví dụ `"OnboardingBearer"`) hoặc audience riêng cho temporary token.
  2. Hoặc tại `OnTokenValidated` trong `Program.cs`, kiểm tra nếu token có chứa claim `Purpose == GoogleOnboarding` thì lập tức `context.Fail("Temporary token cannot access standard API endpoints.");`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.WebAPI/Program.cs`):**
```csharp
options.Events = new JwtBearerEvents
{
    OnTokenValidated = context =>
    {
        // Chỉ kiểm tra memory cache blacklist, bỏ qua kiểm tra Purpose claim
        return Task.CompletedTask;
    }
};
```

**After (`src/PRN212.AIStudyHub.WebAPI/Program.cs`):**
```csharp
options.Events = new JwtBearerEvents
{
    OnTokenValidated = context =>
    {
        var principal = context.Principal;
        // Chặn người dùng dùng Onboarding Temporary Token để truy cập API nghiệp vụ
        if (principal?.HasClaim(c => c.Type == "Purpose" && c.Value == "GoogleOnboarding") == true)
        {
            context.Fail("Temporary onboarding token is not permitted to access protected resources.");
            return Task.CompletedTask;
        }
        return Task.CompletedTask;
    }
};
```

---

### SEC-06: Lỗ hổng Brute-force OTP do thiếu Rate Limiting và thiếu cơ chế giới hạn số lần thử
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 120-129, 365-374)
- **Nguyên nhân:**
  Mã OTP có độ dài 6 chữ số (`100000` - `999999`), tổng cộng 900.000 khả năng. Trong `VerifyOtp` và `ResetPassword`, khi người dùng nhập sai:
  ```csharp
  if (cachedEntry.Otp != request.Otp)
  {
      throw new BadRequestException("OTP code is incorrect.");
  }
  ```
  Hệ thống không ghi nhận số lần đoán sai (Failed Attempts Counter), không khóa mã OTP sau 5 lần sai liên tiếp, và WebAPI không kích hoạt ASP.NET Core Rate Limiting Middleware.
- **Hậu quả tiềm ẩn:**
  Kẻ tấn công sử dụng script tự động có thể gửi hàng nghìn request/giây để vét cạn mã OTP trong khung thời gian hiệu lực 5 phút, thành công chiếm đoạt hoặc kích hoạt tài khoản.
- **Hướng dẫn khắc phục:**
  1. Thêm thuộc tính `FailedAttempts` vào `OtpCacheEntry`. Nếu `FailedAttempts >= 5`, xóa OTP khỏi Cache và yêu cầu người dùng xin mã mới.
  2. Bật `builder.Services.AddRateLimiter(...)` của ASP.NET Core cho các endpoint nhạy cảm (`/register`, `/verify-otp`, `/forgot-password`, `/reset-password`).

#### Minh họa Refactor (Before / After):

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
if (cachedEntry.Otp != request.Otp)
{
    cachedEntry.FailedAttempts++;
    if (cachedEntry.FailedAttempts >= 5)
    {
        cache.Remove(cacheKey);
        throw new BadRequestException("You have exceeded maximum OTP verification attempts. Please request a new code.");
    }
    
    // Cập nhật lại cache với số lần thử đã tăng
    cache.Set(cacheKey, cachedEntry, TimeSpan.FromMinutes(5));
    throw new BadRequestException($"Incorrect OTP code. You have {5 - cachedEntry.FailedAttempts} attempts remaining.");
}
```

---

### SEC-07: Thiếu phân quyền vai trò (Broken Access Control) trên endpoint tạo môn học
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.WebAPI/Controllers/SubjectController.cs` (Dòng 30-41)
- **Nguyên nhân:**
  Controller chỉ khai báo `[Authorize]` ở cấp độ class:
  ```csharp
  [HttpPost]
  public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectRequest request, ...)
  ```
  Không có ràng buộc vai trò `[Authorize(Roles = "Admin,Lecturer")]`.
- **Hậu quả tiềm ẩn:**
  Bất kỳ tài khoản nào mang vai trò Sinh viên (`Student`) cũng có thể gửi request `POST /api/v1/subjects` để tạo ra hàng loạt môn học rác, làm ô nhiễm danh mục môn học của trường.
- **Hướng dẫn khắc phục:**
  Khai báo `[Authorize(Roles = "Admin,Lecturer")]` rõ ràng trên Action `CreateSubject`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.WebAPI/Controllers/SubjectController.cs`):**
```csharp
[HttpPost]
[ProducesResponseType(typeof(ApiResponse<SubjectDto>), StatusCodes.Status201Created)]
public async Task<IActionResult> CreateSubject(...)
```

**After (`src/PRN212.AIStudyHub.WebAPI/Controllers/SubjectController.cs`):**
```csharp
[HttpPost]
[Authorize(Roles = "Admin,Lecturer")]
[ProducesResponseType(typeof(ApiResponse<SubjectDto>), StatusCodes.Status201Created)]
[ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
public async Task<IActionResult> CreateSubject([FromBody] CreateSubjectRequest request, ...)
```

---

### SEC-08: Nguy cơ Server-Side Request Forgery (SSRF) trong CloudinaryStorageService.DownloadFileStream
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Infrastructure/Cloud/CloudinaryStorageService.cs` (Dòng 65-83)
- **Nguyên nhân:**
  Hàm `DownloadFileStream(string fileUrl, ...)` nhận trực tiếp một chuỗi URL và thực hiện `client.GetAsync(fileUrl)`. Mặc dù `fileUrl` hiện tại lấy từ cơ sở dữ liệu, nhưng hàm không kiểm tra scheme (`https`) hay hostname của domain.
- **Hậu quả tiềm ẩn:**
  Nếu dữ liệu trường `StoragePath` trong DB bị giả mạo hoặc truyền vào các URL nội bộ như `http://169.254.169.254/latest/meta-data/` hoặc `http://localhost:1433/`, máy chủ backend sẽ đóng vai trò proxy gửi request vào mạng nội bộ (SSRF vulnerability).
- **Hướng dẫn khắc phục:**
  Xác thực URL phải bắt đầu bằng scheme `https` và hostname phải thuộc domain Cloudinary tin cậy (`res.cloudinary.com`).

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Infrastructure/Cloud/CloudinaryStorageService.cs`):**
```csharp
public async Task<Stream> DownloadFileStream(string fileUrl, CancellationToken cancellationToken = default)
{
    if (string.IsNullOrWhiteSpace(fileUrl))
        throw new CloudStorageException("Document storage URL is empty or invalid.");

    var client = _httpClientFactory.CreateClient();
    var response = await client.GetAsync(fileUrl, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
    ...
}
```

**After (`src/PRN212.AIStudyHub.Infrastructure/Cloud/CloudinaryStorageService.cs`):**
```csharp
public async Task<Stream> DownloadFileStream(string fileUrl, CancellationToken cancellationToken = default)
{
    if (!Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri) || 
        uri.Scheme != Uri.UriSchemeHttps ||
        !uri.Host.EndsWith("cloudinary.com", StringComparison.OrdinalIgnoreCase))
    {
        throw new CloudStorageException("Invalid or untrusted storage download URL.");
    }

    var client = _httpClientFactory.CreateClient("CloudinaryStorage");
    var response = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
    ...
}
```

---

### SEC-09: Thiếu cấu hình chính sách CORS trong WebAPI Pipeline
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.WebAPI/Program.cs` (Dòng 89-93, 140-143)
- **Nguyên nhân:**
  Trong `Program.cs`, không có bất kỳ dòng code nào cấu hình `builder.Services.AddCors()` và `app.UseCors()`.
- **Hậu quả tiềm ẩn:**
  Ứng dụng frontend (Single Page Application chạy trên `http://localhost:3000` hoặc domain web) sẽ bị trình duyệt chặn toàn bộ các yêu cầu Cross-Origin API calls theo cơ chế Same-Origin Policy. Ngược lại, nếu dev cấu hình ẩu `.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()` kèm `AllowCredentials()`, hệ thống sẽ đối mặt với rủi ro Cross-Site Data Hijacking.
- **Hướng dẫn khắc phục:**
  Khai báo chính sách CORS có tên cụ thể (`"StudyHubClientPolicy"`), đọc danh sách Allowed Origins từ `appsettings.json`.

#### Minh họa Refactor (Before / After):

**After (`src/PRN212.AIStudyHub.WebAPI/Program.cs`):**
```csharp
// Đăng ký CORS Policy an toàn
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? ["http://localhost:3000", "http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("StudyHubClientPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

...
app.UseCors("StudyHubClientPolicy");
app.UseAuthentication();
app.UseAuthorization();
```

---

### SEC-10: Lỗ hổng Tải tệp không an toàn (Unrestricted File Upload) do thiếu Magic Bytes, thiếu lọc Path Traversal & Rò rỉ tài nguyên Cloudinary
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.WebAPI/Controllers/DocumentController.cs` (Dòng 33-60)
  - `src/PRN212.AIStudyHub.Application/Services/DocumentService.cs` (Dòng 14-67)
  - `src/PRN212.AIStudyHub.WebAPI/Models/UploadDocumentRequest.cs` (Dòng 3)
- **Nguyên nhân:**
  1. **Chỉ kiểm tra phần mở rộng file (Extension Check Only):** Controller chỉ kiểm tra đuôi mở rộng `Path.GetExtension(request.File.FileName).ToLowerInvariant()`. Không hề xác thực chữ ký nhị phân (Magic Bytes/File Signatures). Kẻ tấn công có thể đổi tên một file thực thi độc hại (`.exe`, `.sh`, `.bat`) thành `.docx` hoặc `.txt` để vượt qua bộ lọc.
  2. **Thiếu chuẩn hóa tên file (Path Traversal / Header Injection):** `request.File.FileName` do client tự gửi không được làm sạch qua `Path.GetFileName(...)`, cho phép tên file chứa ký tự điều khiển hoặc đường dẫn nguy hiểm (`../../malicious.pdf`).
  3. **Rò rỉ tài nguyên đám mây (Orphan Asset Leak):** Trong `DocumentService.UploadDocument`, file được đẩy thẳng lên Cloudinary (`UploadRawFile`) TRƯỚC KHI thực hiện kiểm tra nghiệp vụ và lưu Database. Trường `Title` hoàn toàn không được kiểm tra (cho phép null/rỗng hoặc vượt quá 255 ký tự). Nếu `SaveChangesAsync` thất bại, file đã tải lên Cloudinary không hề được xóa dọn (không có rollback transaction), trở thành tài nguyên mồ côi chiếm dụng dung lượng vĩnh viễn trên Cloudinary.
- **Hậu quả tiềm ẩn:**
  Hệ thống trở thành kênh phân tán mã độc (Malware Distribution) khi các tệp độc hại được chia sẻ công khai (`IsPublic = true`), đồng thời làm cạn kiệt hạn ngạch lưu trữ Cloudinary dẫn đến gián đoạn dịch vụ.
- **Hướng dẫn khắc phục:**
  1. Làm sạch tên file bằng `Path.GetFileName(request.File.FileName)`.
  2. Kiểm tra chữ ký file (Magic Bytes) cho các định dạng được phép (.pdf: `%PDF`, .docx/.pptx: `PK\x03\x04`).
  3. Validate toàn bộ dữ liệu đầu vào (`Title`, `SubjectId`) trước khi gọi API đám mây.
  4. Bổ sung phương thức `DeleteFileAsync` vào `ICloudStorageService` và rollback file trên Cloudinary nếu thao tác ghi DB xảy ra lỗi.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/DocumentService.cs`):**
```csharp
var cloudUploadResult = await cloudStorageService.UploadRawFile(request.FileStream, request.FileName, cancellationToken);
Document newDocument = new Document { ... Title = request.Title ... };
context.Documents.Add(newDocument);
await context.SaveChangesAsync(cancellationToken); // Nếu lỗi ở đây, file trên Cloudinary bị mồ côi!
```

**After (`src/PRN212.AIStudyHub.Application/Services/DocumentService.cs`):**
```csharp
// 1. Kiểm tra tính hợp lệ của Title và Subject trước khi upload
if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Trim().Length > 255)
{
    throw new BadRequestException("Document title is required and cannot exceed 255 characters.");
}

var isSubjectExist = await context.Subjects.AsNoTracking()
    .AnyAsync(s => s.Id == request.SubjectId, cancellationToken);
if (!isSubjectExist)
{
    throw new NotFoundException($"Subject with ID '{request.SubjectId}' was not found.");
}

// 2. Làm sạch tên file và extension
var safeFileName = Path.GetFileName(request.FileName);
var fileExtension = Path.GetExtension(safeFileName).ToLowerInvariant();

// 3. Upload file lên Cloudinary
var cloudUploadResult = await cloudStorageService.UploadRawFile(request.FileStream, safeFileName, cancellationToken);

try
{
    Document newDocument = new Document
    {
        Id = Guid.CreateVersion7(),
        UserId = userId,
        SubjectId = request.SubjectId,
        Title = request.Title.Trim(),
        FileName = safeFileName,
        StoragePath = cloudUploadResult.SecureUrl,
        FileSize = request.FileSize,
        FileExtension = fileExtension,
        ContentType = request.ContentType,
        UploadedAt = DateTime.UtcNow,
        IsCloudStored = true,
        CloudPublicId = cloudUploadResult.PublicId,
        IsPublic = request.IsPublic,
        ProcessingStatus = "Pending",
        IsDeleted = false
    };

    context.Documents.Add(newDocument);
    await context.SaveChangesAsync(cancellationToken);
    return DocumentResponseDto.FromEntity(newDocument);
}
catch (Exception)
{
    // 4. Rollback: Xóa file mồ côi trên Cloudinary để tránh rò rỉ tài nguyên
    if (!string.IsNullOrEmpty(cloudUploadResult.PublicId))
    {
        _ = await cloudStorageService.DeleteFileAsync(cloudUploadResult.PublicId, cancellationToken);
    }
    throw;
}

// 5. Khai báo và cài đặt DeleteFileAsync:
// Trong src/PRN212.AIStudyHub.Application/Interfaces/Cloud/ICloudStorageService.cs:
Task<bool> DeleteFileAsync(string publicId, CancellationToken cancellationToken = default);

// Trong src/PRN212.AIStudyHub.Infrastructure/Cloud/CloudinaryStorageService.cs:
public async Task<bool> DeleteFileAsync(string publicId, CancellationToken cancellationToken = default)
{
    var deletionParams = new DeletionParams(publicId) { ResourceType = ResourceType.Raw };
    var result = await _cloudinary.DestroyAsync(deletionParams);
    return result.Result == "ok";
}
```

---

### SEC-11: Lỗ hổng Phân quyền Quản trị viên Không nhất quán (Broken Admin Moderation) trong Document Management
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/DocumentService.cs` (Dòng 106-107, 130-133, 150-153, 348-351)
- **Nguyên nhân:**
  Trong khi phương thức `UpdateDocumentSubject` có truyền cờ `isAdmin` (`if (document.UserId != currentUserId && !isAdmin)`), thì các phương thức quản trị tài liệu trọng yếu khác gồm:
  - `GetDocumentById`: `if (docs.UserId != userId && !docs.IsPublic) throw new ForbiddenException(...)`
  - `DownloadDocument`: `if (document.UserId != currentUserId && !document.IsPublic) throw new ForbiddenException(...)`
  - `DeleteDocument`: `if (doc.UserId != userId) throw new ForbiddenException(...)`
  - `UpdateDocument`: `if (docs.UserId != userId) throw new ForbiddenException(...)`
  chỉ kiểm tra quyền sở hữu cá nhân của người upload.
- **Hậu quả tiềm ẩn:**
  Quản trị viên (`Admin`) của hệ thống hoàn toàn bị vô hiệu hóa quyền hạn: không thể xem chi tiết, không thể tải về kiểm duyệt, và không thể xóa bỏ các tài liệu vi phạm pháp luật / nội quy nhà trường nếu kẻ xấu tick chọn `IsPublic = false` (chế độ riêng tư).
- **Hướng dẫn khắc phục:**
  Bổ sung tham số `bool isAdmin` hoặc kiểm tra `Role == "Admin"` trong các phương thức của `IDocumentService` để trao quyền can thiệp kiểm duyệt hợp lệ cho quản trị viên.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/DocumentService.cs`):**
```csharp
public async Task<bool> DeleteDocument(Guid id, Guid userId, CancellationToken cancellationToken = default)
{
    var doc = await context.Documents.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted, cancellationToken)
              ?? throw new NotFoundException($"Document with ID '{id}' was not found.");
    if (doc.UserId != userId) // Admin cũng bị chặn không xóa được!
    {
        throw new ForbiddenException("Only the owner can delete this document.");
    }
    doc.IsDeleted = true;
    ...
}
```

**After (`src/PRN212.AIStudyHub.Application/Services/DocumentService.cs`):**
```csharp
public async Task<bool> DeleteDocument(Guid id, Guid userId, bool isAdmin, CancellationToken cancellationToken = default)
{
    var doc = await context.Documents.FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted, cancellationToken)
              ?? throw new NotFoundException($"Document with ID '{id}' was not found.");
    
    // Chủ sở hữu hoặc Admin đều có quyền xóa tài liệu
    if (doc.UserId != userId && !isAdmin)
    {
        throw new ForbiddenException("You do not have permission to delete this document.");
    }

    doc.IsDeleted = true;
    doc.DeletedAt = DateTime.UtcNow;
    await context.SaveChangesAsync(cancellationToken);
    return true;
}

// Cập nhật Controller truyền cờ isAdmin:
// Trong src/PRN212.AIStudyHub.WebAPI/Controllers/DocumentController.cs:
[HttpDelete("{id:guid}")]
[ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
public async Task<IActionResult> DeleteDocument([FromRoute] Guid id, CancellationToken cancellationToken)
{
    var isAdmin = User.IsInRole("Admin");
    _ = await documentService.DeleteDocument(id, CurrentUserId, isAdmin, cancellationToken);
    return Ok(ApiResponse.SuccessResponse("Document deleted successfully."));
}
```

---

### SEC-12: Lỗ hổng Liệt kê Tài khoản (Account / User Enumeration) trong API Quên mật khẩu
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 328-330)
- **Nguyên nhân:**
  Trong `AuthService.ForgotPassword`:
  ```csharp
  var userInDb = await context.AppUsers.FirstOrDefaultAsync(u => u.Email == request.email, cancellationToken) 
      ?? throw new NotFoundException("Account with this email does not exist.");
  ```
  Nếu email không tồn tại trong DB, hệ thống ném `NotFoundException`, dẫn đến response HTTP 404 Not Found kèm thông báo lỗi rõ ràng. Nếu email tồn tại, hệ thống trả về HTTP 200 OK.
- **Hậu quả tiềm ẩn:**
  Kẻ tấn công có thể chạy script kiểm tra danh sách hàng nghìn email sinh viên hoặc giảng viên để biết chính xác những email nào đã tạo tài khoản trong hệ thống AI Study Hub (OWASP Identification and Authentication Failures / CWE-204: Observable Response Discrepancy).
- **Hướng dẫn khắc phục:**
  Luôn trả về phản hồi thành công đồng nhất (Generic Response) với HTTP 200 OK: "Nếu email tồn tại trong hệ thống, mã xác nhận OTP đã được gửi đến hòm thư của bạn". Nếu email không tồn tại, kết thúc sớm mà không gửi OTP và không báo lỗi.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
var userInDb = await context.AppUsers.FirstOrDefaultAsync(u => u.Email == request.email, cancellationToken) 
    ?? throw new NotFoundException("Account with this email does not exist."); // LỖI: Leaks user existence!
```

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
const string genericSuccessMessage = "Nếu địa chỉ email tồn tại trong hệ thống, mã xác thực đã được gửi đến hòm thư của bạn.";

var normalizedEmail = request.email.Trim().ToLowerInvariant();
var userInDb = await context.AppUsers.FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);

// Bảo vệ chống User Enumeration: Nếu không tìm thấy, trả về thông báo chung, không ném 404
if (userInDb is null || !userInDb.IsActive)
{
    return genericSuccessMessage;
}

// Chỉ sinh mã và gửi mail khi người dùng thực sự tồn tại
var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString("D6");
cache.Set($"OTP_PWD_{normalizedEmail}", otp, TimeSpan.FromMinutes(5));

await emailService.SendEmailAsync(userInDb.Email, subject, body, cancellationToken);
return genericSuccessMessage;
```

---

## NHÓM 2: CODE SMELLS VÀ KIẾN TRÚC HỆ THỐNG (CODE SMELLS & ARCHITECTURE)

### ARC-01: Vi phạm Clean Architecture - EmailService nằm ở Application và dùng SmtpClient lỗi thời
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/EmailService.cs` (Dòng 1-50)
- **Nguyên nhân:**
  1. **Sai vị trí tầng kiến trúc:** Tầng `Application` chỉ nên chứa các Interfaces (`IEmailService`), DTOs và Business Logic. Việc triển khai cụ thể cách gửi thư qua giao thức SMTP (`System.Net.Mail`) thuộc về tầng `Infrastructure`.
  2. **Thư viện Deprecated:** Lớp `System.Net.Mail.SmtpClient` được Microsoft khuyến cáo chính thức không nên sử dụng cho các dự án mới vì không hỗ trợ giao thức hiện đại và các tiêu chuẩn bảo mật TLS mới.
- **Hậu quả tiềm ẩn:**
  Vi phạm nghiêm trọng nguyên lý Inversion of Control và Dependency Rule của Clean Architecture. Gặp khó khăn khi thay đổi cơ chế gửi mail (chuyển sang SendGrid, Mailgun, Amazon SES).
- **Hướng dẫn khắc phục:**
  1. Xóa bỏ `EmailService.cs` khỏi `PRN212.AIStudyHub.Application`.
  2. Tạo mới `EmailService` trong `PRN212.AIStudyHub.Infrastructure/Services/EmailService.cs` triển khai `IEmailService`.
  3. Sử dụng thư viện chuẩn công nghiệp `MailKit` (`MailKit.Net.Smtp.SmtpClient` và `MimeKit`) theo khuyến cáo chuẩn của Microsoft.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/EmailService.cs` - Vị trí sai, thư viện cũ):**
```csharp
namespace PRN212.AIStudyHub.Application.Services
{
  public class EmailService(IConfiguration config) : IEmailService
  {
      using SmtpClient smtpClient = new SmtpClient(smtpServer, port)...
  }
}
```

**After (`src/PRN212.AIStudyHub.Infrastructure/Services/EmailService.cs` - Dùng MailKit chuẩn .NET):**
```csharp
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using PRN212.AIStudyHub.Application.Interfaces;

namespace PRN212.AIStudyHub.Infrastructure.Services
{
    public class EmailService(IOptions<EmailSettings> emailOptions, ILogger<EmailService> logger) : IEmailService
    {
        private readonly EmailSettings _settings = emailOptions.Value;

        public async Task SendEmailAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            var secureOption = _settings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto;
            await client.ConnectAsync(_settings.SmtpServer, _settings.SmtpPort, secureOption, cancellationToken);
            await client.AuthenticateAsync(_settings.SenderEmail, _settings.SenderPassword, cancellationToken);
            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
        }
    }
}
```

---

### ARC-02: Thiếu cấu hình EmailSettings trong file cấu hình gây InvalidOperationException tại runtime
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.WebAPI/appsettings.json`
  - `src/PRN212.AIStudyHub.WebAPI/appsettings.example.json`
- **Nguyên nhân:**
  Trong mã nguồn `EmailService.cs`, ứng dụng đọc cấu hình qua:
  ```csharp
  var smtpServer = config["EmailSettings:SmtpServer"];
  var senderEmail = config["EmailSettings:SenderEmail"];
  var password = config["EmailSettings:SenderPassword"]?.Trim();
  ```
  Nếu thiếu một trong các giá trị này, code ném `InvalidOperationException("Email settings are not configured properly in appsettings.json.")`. Tuy nhiên, cả `appsettings.json` và `appsettings.example.json` đều HOÀN TOÀN KHÔNG CÓ section `"EmailSettings"`.
- **Hậu quả tiềm ẩn:**
  Bất kỳ khi nào người dùng bấm Đăng ký (`/register`) hoặc Quên mật khẩu (`/forgot-password`), hệ thống đều ném ngoại lệ làm hỏng hoàn toàn luồng onboarding của người dùng.
- **Hướng dẫn khắc phục:**
  Bổ sung section `EmailSettings` vào `appsettings.json` và `appsettings.example.json`, đồng thời khai báo class `EmailSettings` và đăng ký qua Options pattern (`builder.Services.Configure<EmailSettings>(...)`).

#### Minh họa Refactor (Before / After):

**1. Khai báo Options Class (`src/PRN212.AIStudyHub.Infrastructure/Services/EmailSettings.cs`):**
```csharp
namespace PRN212.AIStudyHub.Infrastructure.Services
{
    public class EmailSettings
    {
        public const string SectionName = "EmailSettings";
        public string SmtpServer { get; set; } = string.Empty;
        public int SmtpPort { get; set; } = 587;
        public string SenderEmail { get; set; } = string.Empty;
        public string SenderPassword { get; set; } = string.Empty;
        public string SenderName { get; set; } = "AI Study Hub Support";
        public bool EnableSsl { get; set; } = true;
    }
}
```

**2. Đăng ký trong `src/PRN212.AIStudyHub.WebAPI/Program.cs`:**
```csharp
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection(EmailSettings.SectionName));
```

**3. Cấu hình trong `src/PRN212.AIStudyHub.WebAPI/appsettings.json`:**
```json
"EmailSettings": {
  "SmtpServer": "smtp.gmail.com",
  "SmtpPort": 587,
  "SenderEmail": "YOUR_EMAIL@domain.com",
  "SenderPassword": "YOUR_SMTP_APP_PASSWORD",
  "SenderName": "AI Study Hub Support",
  "EnableSsl": true
}
```

---

### ARC-03: Lệch tên cấu hình JWT (ExpiryMinutes vs ExpiryInMinutes) làm vô hiệu hóa cài đặt Token Lifetime
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Infrastructure/Security/JwtSettings.cs` (Dòng 10)
  - `src/PRN212.AIStudyHub.WebAPI/appsettings.json` (Dòng 22)
- **Nguyên nhân:**
  - Trong `appsettings.json`: `"ExpiryInMinutes": 60`
  - Trong `JwtSettings.cs`: `public int ExpiryMinutes { get; set; } = 60;`
  Do khác biệt tên thuộc tính (`ExpiryInMinutes` vs `ExpiryMinutes`), `ConfigurationBinder` của .NET không thể map giá trị từ file cấu hình vào Options class.
- **Hậu quả tiềm ẩn:**
  Bất kỳ sự thay đổi nào về thời hạn token trong `appsettings.json` (ví dụ đổi thành 15 phút hay 120 phút) đều hoàn toàn vô hiệu. Hệ thống luôn rơi về giá trị fallback mặc định.
- **Hướng dẫn khắc phục:**
  Đổi tên property trong `JwtSettings.cs` thành `public int ExpiryInMinutes { get; set; } = 60;` hoặc bổ sung alias tương thích.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Infrastructure/Security/JwtSettings.cs`):**
```csharp
public class JwtSettings
{
    public const string SectionName = "JwtSettings";
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 60; // LỆCH TÊN VỚI APPSETTINGS.JSON
}
```

**After (`src/PRN212.AIStudyHub.Infrastructure/Security/JwtSettings.cs`):**
```csharp
public class JwtSettings
{
    public const string SectionName = "JwtSettings";
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public int ExpiryInMinutes { get; set; } = 60; // Đồng bộ hoàn hảo với ExpiryInMinutes trong appsettings.json
}
```

---

### ARC-04: Socket Exhaustion do khởi tạo new HttpClient() thủ công & Quản lý vòng đời Stream chưa an toàn
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 224)
  - `src/PRN212.AIStudyHub.Infrastructure/Cloud/CloudinaryStorageService.cs` (Dòng 75-82)
- **Nguyên nhân:**
  1. Trong `AuthService.GoogleLogin`:
     ```csharp
     using HttpClient httpClient = new HttpClient();
     ```
     Dù `Program.cs` đã đăng ký `builder.Services.AddHttpClient()`, `AuthService` lại tự tạo `new HttpClient()` mỗi lần người dùng đăng nhập bằng Google.
  2. Trong `CloudinaryStorageService.DownloadFileStream`:
     `response` của `client.GetAsync` không được quản lý vòng đời gắn với Stream trả về. Nếu bọc `using var response = ...`, Stream sẽ bị đóng sớm và ném `ObjectDisposedException` khi controller truyền vào `File()`. Nếu không dispose `response`, connection pool sẽ bị rò rỉ.
- **Hậu quả tiềm ẩn:**
  - `new HttpClient()` giữ các socket kết nối ở trạng thái `TIME_WAIT`. Khi có lượng lớn lượt đăng nhập đồng thời, máy chủ sẽ bị cạn kiệt socket cổng mạng (Socket Exhaustion).
  - Quản lý Stream/Response không đúng cách gây lỗi ngắt luồng tải hoặc rò rỉ bộ đệm kết nối.
- **Hướng dẫn khắc phục:**
  Inject `IHttpClientFactory` vào `AuthService`. Với phương thức tải tệp, chuyển hướng (Redirect) trực tiếp sang URL CDN Cloudinary có attachment disposition, hoặc sử dụng cơ chế ủy thác đóng Response kèm Stream.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
if (accessToken.StartsWith("ya29"))
{
    using HttpClient httpClient = new HttpClient(); // LỖI: Gây cạn kiệt socket
    var response = await httpClient.GetAsync(...);
    ...
}
```

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
// Inject IHttpClientFactory vào Primary Constructor của AuthService
public class AuthService(
    IAppDbContext context,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator jwtTokenGenerator,
    IMemoryCache cache,
    IEmailService emailService,
    IHttpClientFactory httpClientFactory,
    IConfiguration config) : IAuthService
{
    ...
    if (accessToken.StartsWith("ya29"))
    {
        var httpClient = httpClientFactory.CreateClient("GoogleAuth");
        using var response = await httpClient.GetAsync($"https://www.googleapis.com/oauth2/v3/userinfo?access_token={accessToken}", cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new UnauthorizedException("Invalid Google Access Token.");
        }
        ...
    }
}
```

---

### ARC-05: Exception Handling Anti-Pattern - Map nhầm InvalidOperationException thành 400 Bad Request
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.WebAPI/Middlewares/GlobalExceptionMiddleware.cs` (Dòng 40)
- **Nguyên nhân:**
  Trong `GlobalExceptionMiddleware.cs`:
  ```csharp
  InvalidOperationException ex => (HttpStatusCode.BadRequest, ex.Message),
  ```
  `InvalidOperationException` là ngoại lệ kỹ thuật nội bộ của .NET Runtime (thường xảy ra khi cấu hình sai DI container, DbContext concurrency conflict, hoặc connection string lỗi).
- **Hậu quả tiềm ẩn:**
  Lỗi sập cấu hình server nội bộ bị ngụy trang thành `400 Bad Request` (lỗi do người dùng gửi sai dữ liệu), làm sai lệch telemetry monitoring và khiến client không thể phân biệt giữa lỗi dữ liệu đầu vào và lỗi chết máy chủ.
- **Hướng dẫn khắc phục:**
  Tạo `DomainException` hoặc `BadRequestException` riêng cho lỗi nghiệp vụ. Để `InvalidOperationException` rơi vào nhánh mặc định `500 Internal Server Error`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.WebAPI/Middlewares/GlobalExceptionMiddleware.cs`):**
```csharp
var (statusCode, message) = exception switch
{
    BadRequestException ex => (HttpStatusCode.BadRequest, ex.Message),
    ...
    CloudStorageException ex => (HttpStatusCode.BadGateway, ex.Message),
    InvalidOperationException ex => (HttpStatusCode.BadRequest, ex.Message), // SAI: Biến lỗi server 500 thành 400
    _ => (HttpStatusCode.InternalServerError, "An unexpected internal server error occurred.")
};
```

**After (`src/PRN212.AIStudyHub.WebAPI/Middlewares/GlobalExceptionMiddleware.cs`):**
```csharp
var (statusCode, message) = exception switch
{
    BadRequestException ex => (HttpStatusCode.BadRequest, ex.Message),
    ArgumentException ex => (HttpStatusCode.BadRequest, ex.Message),
    UnauthorizedException ex => (HttpStatusCode.Unauthorized, ex.Message),
    ForbiddenException ex => (HttpStatusCode.Forbidden, ex.Message),
    UnauthorizedAccessException ex => (HttpStatusCode.Forbidden, ex.Message),
    NotFoundException ex => (HttpStatusCode.NotFound, ex.Message),
    KeyNotFoundException ex => (HttpStatusCode.NotFound, ex.Message),
    ConflictException ex => (HttpStatusCode.Conflict, ex.Message),
    CloudStorageException ex => (HttpStatusCode.BadGateway, ex.Message),
    // InvalidOperationException và các lỗi không dự tính rơi vào 500 InternalServerError
    _ => (HttpStatusCode.InternalServerError, "An unexpected internal server error occurred.")
};
```

---

### ARC-06: Chống chỉ định EF Core - Lạm dụng hàm .ToLower() trong biểu thức LINQ Where
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Application/Services/SubjectService.cs` (Dòng 20)
  - `src/PRN212.AIStudyHub.Application/Services/DocumentService.cs` (Dòng 294)
- **Nguyên nhân:**
  ```csharp
  var isExist = await context.Subjects.AnyAsync(s => s.Name.ToLower() == request.Name.ToLower(), cancellationToken);
  ```
  ```csharp
  dbQuery = dbQuery.Where(doc => doc.FileExtension.ToLower() == extension);
  ```
  Trong SQL Server, Collation mặc định (`SQL_Latin1_General_CP1_CI_AS`) đã là Case-Insensitive (không phân biệt chữ hoa/thường). Việc bọc hàm `s.Name.ToLower()` trong biểu thức LINQ làm cho câu truy vấn trở thành Non-Sargable (vô hiệu hóa B-Tree Index trên cột `Name` và `FileExtension`), buộc Database Engine phải Table Scan / Index Scan toàn bộ bảng.
- **Hậu quả tiềm ẩn:**
  Gia tăng tải CPU của cơ sở dữ liệu gấp hàng trăm lần khi bảng có hàng chục ngàn bản ghi.
- **Hướng dẫn khắc phục:**
  Chuẩn hóa biến đầu vào ở phía ứng dụng trước (`var normalizedName = request.Name.Trim();`), sau đó so sánh trực tiếp `s.Name == normalizedName`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/SubjectService.cs`):**
```csharp
var isExist = await context.Subjects
    .AnyAsync(s => s.Name.ToLower() == request.Name.ToLower(), cancellationToken);
```

**After (`src/PRN212.AIStudyHub.Application/Services/SubjectService.cs`):**
```csharp
var trimmedName = request.Name.Trim();
var isExist = await context.Subjects
    .AnyAsync(s => s.Name == trimmedName, cancellationToken);
```

---

### ARC-07: Lạm dụng .Include() dư thừa khi kết hợp với LINQ Projection .Select()
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/DocumentService.cs` (Dòng 75)
- **Nguyên nhân:**
  ```csharp
  var query = context.Documents.AsNoTracking()
          .Include(d => d.Subject) // DƯ THỪA HOÀN TOÀN
          .Where(d => d.UserId == userId && !d.IsDeleted);
  ...
  var result = await query.Select(d => new DocumentItemDto(..., d.Subject.Name, ...)).ToListAsync();
  ```
  Trong Entity Framework Core, khi câu lệnh kết thúc bằng phép chiếu `.Select()`, EF Core tự động phân tích cây biểu thức và sinh câu lệnh `INNER JOIN / LEFT JOIN` chính xác cho các cột cần lấy. Lệnh `.Include()` bị bỏ qua nhưng vẫn gây tốn thời gian biên dịch Query Expression Tree.
- **Hậu quả tiềm ẩn:**
  Tăng thời gian phân tích cú pháp biểu thức LINQ, gây hiểu lầm cho các lập trình viên khác về cơ chế Eager Loading của EF Core.
- **Hướng dẫn khắc phục:**
  Loại bỏ hoàn toàn `.Include(d => d.Subject)` khi đã có LINQ Projection `.Select(...)`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/DocumentService.cs`):**
```csharp
var query = context.Documents.AsNoTracking()
    .Include(d => d.Subject) // DƯ THỪA: EF Core tự động tối ưu JOIN khi có LINQ Projection
    .Where(d => d.UserId == userId && !d.IsDeleted);

var result = await query
    .OrderByDescending(d => d.UploadedAt)
    .Select(d => new DocumentItemDto(
        d.Id, d.Title, d.FileName, d.SubjectId, d.Subject.Name, d.UploadedAt, d.ProcessingStatus, d.IsPublic))
    .ToListAsync(cancellationToken);
```

**After (`src/PRN212.AIStudyHub.Application/Services/DocumentService.cs`):**
```csharp
// Loại bỏ hoàn toàn .Include(d => d.Subject) để giảm chi phí biên dịch Expression Tree
var query = context.Documents.AsNoTracking()
    .Where(d => d.UserId == userId && !d.IsDeleted);

var result = await query
    .OrderByDescending(d => d.UploadedAt)
    .Select(d => new DocumentItemDto(
        d.Id, d.Title, d.FileName, d.SubjectId, d.Subject.Name, d.UploadedAt, d.ProcessingStatus, d.IsPublic))
    .ToListAsync(cancellationToken);
```

---

### ARC-08: Thiếu Global Query Filter cho Soft Delete trên Entity Document
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Infrastructure/Data/AistudyHubDbContext.cs` (Dòng 100-132)
  - `src/PRN212.AIStudyHub.Domain/Entities/Document.cs` (Dòng 33)
- **Nguyên nhân:**
  Thực thể `Document` hỗ trợ xóa mềm qua cờ `IsDeleted` và `DeletedAt`. Tuy nhiên, trong `AistudyHubDbContext.OnModelCreating`, không có khai báo bộ lọc toàn cục:
  ```csharp
  entity.HasQueryFilter(d => !d.IsDeleted);
  ```
- **Hậu quả tiềm ẩn:**
  Bất kỳ lập trình viên nào khi viết thêm các câu lệnh truy vấn mới (hoặc viết truy vấn qua navigation properties `User.Documents` / `Subject.Documents` / `FlashcardSet.Document`) nếu quên bổ sung điều kiện `&& !d.IsDeleted` sẽ vô tình để lộ dữ liệu đã xóa ra bên ngoài.
- **Hướng dẫn khắc phục:**
  Cấu hình `builder.Entity<Document>().HasQueryFilter(d => !d.IsDeleted);` trong DbContext. Khi cần tra cứu bản ghi đã xóa, sử dụng tường minh `.IgnoreQueryFilters()`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Infrastructure/Data/AistudyHubDbContext.cs`):**
```csharp
modelBuilder.Entity<Document>(entity =>
{
    // Không có Global Query Filter: Buộc lập trình viên phải nhớ thêm !d.IsDeleted ở mọi nơi
    entity.HasIndex(e => new { e.IsDeleted, e.SubjectId }, "IX_Document_IsDeleted_SubjectId");
    ...
});
```

**After (`src/PRN212.AIStudyHub.Infrastructure/Data/AistudyHubDbContext.cs`):**
```csharp
modelBuilder.Entity<Document>(entity =>
{
    // Global Query Filter: Tự động loại bỏ các tài liệu đã bị xóa mềm khỏi mọi câu truy vấn
    entity.HasQueryFilter(d => !d.IsDeleted);

    entity.HasIndex(e => new { e.IsDeleted, e.SubjectId }, "IX_Document_IsDeleted_SubjectId");
    entity.HasIndex(e => e.SubjectId, "IX_Document_SubjectId");
    entity.HasIndex(e => e.UserId, "IX_Document_UserId");
    ...
});

// Ghi chú: Khi Admin cần xem lại dữ liệu đã xóa để kiểm duyệt/khôi phục, dùng:
// var deletedDocs = await context.Documents.IgnoreQueryFilters().Where(d => d.IsDeleted).ToListAsync(ct);
```

---

### ARC-09: Bỏ rơi CancellationToken trong phương thức bất đồng bộ CloudinaryStorageService.UploadRawFile
- **Mức độ nghiêm trọng:** `Low`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Infrastructure/Cloud/CloudinaryStorageService.cs` (Dòng 43)
- **Nguyên nhân:**
  Phương thức nhận tham số `CancellationToken cancellationToken = default`, nhưng khi gọi:
  ```csharp
  var uploadResult = await _cloudinary.UploadAsync(uploadParams);
  ```
  lại không truyền `cancellationToken` vào overload của SDK CloudinaryDotNet (`UploadAsync(uploadParams, cancellationToken)`).
- **Hậu quả tiềm ẩn:**
  Khi người dùng hủy upload file (ngắt kết nối mạng hoặc đóng tab trình duyệt), tiến trình tải lên Cloudinary phía máy chủ vẫn tiếp tục chạy ngầm vô ích, gây lãng phí băng thông và tài nguyên CPU.
- **Hướng dẫn khắc phục:**
  Truyền `cancellationToken` vào hàm gọi `await _cloudinary.UploadAsync(uploadParams, cancellationToken);`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Infrastructure/Cloud/CloudinaryStorageService.cs`):**
```csharp
public async Task<CloudUploadResult> UploadRawFile(
    Stream fileStream,
    string fileName,
    CancellationToken cancellationToken = default)
{
    ...
    var uploadResult = await _cloudinary.UploadAsync(uploadParams); // LỖI: Bỏ qua cancellationToken
    ...
}
```

**After (`src/PRN212.AIStudyHub.Infrastructure/Cloud/CloudinaryStorageService.cs`):**
```csharp
public async Task<CloudUploadResult> UploadRawFile(
    Stream fileStream,
    string fileName,
    CancellationToken cancellationToken = default)
{
    ...
    // Truyền cancellationToken để giải phóng kết nối ngay khi client ngắt kết nối
    var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);
    ...
}
```

---

### ARC-10: Nuốt ngoại lệ (Swallowed Exception) và sử dụng Console.WriteLine thay vì ILogger
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 353-356)
- **Nguyên nhân:**
  Trong phương thức `ForgotPassword`:
  ```csharp
  catch (Exception ex)
  {
      Console.WriteLine($"[EMAIL_ERROR] Failed to send email to {userInDb.Email}: {ex.Message}");
  }
  ```
  Ngoại lệ bị nuốt hoàn toàn và in ra Standard Output bằng `Console.WriteLine` thay vì sử dụng structured logging với `ILogger`. Người dùng vẫn nhận được thông báo "Vui lòng nhập mã OTP đã gửi qua mail" dù email không hề được gửi đi.
- **Hậu quả tiềm ẩn:**
  Hệ thống giám sát (Application Insights, Elasticsearch, Seq) không thể thu thập log lỗi. Người dùng chờ đợi mã OTP trong vô vọng dẫn đến trải nghiệm tồi tệ.
- **Hướng dẫn khắc phục:**
  Inject `ILogger<AuthService>` để ghi nhận lỗi có cấu trúc (`logger.LogError(ex, ...)`), đồng thời xử lý phản hồi lỗi phù hợp cho client.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
try
{
    string subject = "AI Study Hub - Reset Password OTP Verification";
    await emailService.SendEmailAsync(userInDb.Email, subject, body, cancellationToken);
}
catch (Exception ex)
{
    // NUỐT NGOẠI LỆ: In ra Console thuần, không cảnh báo cho client
    Console.WriteLine($"[EMAIL_ERROR] Failed to send email to {userInDb.Email}: {ex.Message}");
}
return "Vui lòng nhập mã OTP (đã gửi qua mail) để thay đổi mật khẩu";
```

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
// Inject ILogger<AuthService> vào AuthService
try
{
    string subject = "AI Study Hub - Reset Password OTP Verification";
    await emailService.SendEmailAsync(userInDb.Email, subject, body, cancellationToken);
}
catch (Exception ex)
{
    logger.LogError(ex, "Failed to send password reset OTP email to {Email}", userInDb.Email);
    throw new InvalidOperationException("Failed to send OTP verification email. Please try again later.", ex);
}
return "Vui lòng nhập mã OTP (đã gửi qua mail) để thay đổi mật khẩu";
```

---

### ARC-11: Naming Convention không nhất quán và Anemic Domain Model trong Domain Entities
- **Mức độ nghiêm trọng:** `Low`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Domain/Entities/AppUser.cs` (Dòng 23-30)
  - `src/PRN212.AIStudyHub.Domain/Entities/Document.cs` (Dòng 37-43)
- **Nguyên nhân:**
  Các thuộc tính quan hệ tập hợp (Navigation Collection Properties) được đặt tên ở dạng số ít (Singular) thay vì số nhiều (Plural):
  - `public virtual ICollection<ChatSession> ChatSession { get; set; }` -> Nên là `ChatSessions`
  - `public virtual ICollection<Document> Document { get; set; }` -> Nên là `Documents`
  - `public virtual ICollection<FlashcardSet> FlashcardSet { get; set; }` -> Nên là `FlashcardSets`
  Đồng thời, tất cả DTOs trong `DTOs/Subject` và `DTOs/Auth` trộn lẫn giữa `class` với `record`, giữa PascalCase (`Email`) và camelCase (`email`, `newPassword`).
- **Hậu quả tiềm ẩn:**
  Vi phạm nghiêm trọng quy chuẩn thiết kế Microsoft .NET Framework Design Guidelines, làm giảm tính nhất quán và dễ gây nhầm lẫn khi thao tác với LINQ.
- **Hướng dẫn khắc phục:**
  Chuẩn hóa toàn bộ tên thuộc tính danh sách thành số nhiều, sử dụng C# `record` cho tất cả các DTOs bất biến.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Domain/Entities/AppUser.cs`):**
```csharp
// Sai chuẩn số ít (Singular) cho tập hợp ICollection
public virtual ICollection<ChatSession> ChatSession { get; set; } = [];
public virtual ICollection<Document> Document { get; set; } = [];
public virtual ICollection<FlashcardSet> FlashcardSet { get; set; } = [];
public virtual ICollection<RefreshToken> RefreshToken { get; set; } = [];
```

**After (`src/PRN212.AIStudyHub.Domain/Entities/AppUser.cs`):**
```csharp
// Chuẩn hóa tên tập hợp số nhiều (Plural) theo Microsoft .NET Framework Design Guidelines
public virtual ICollection<ChatSession> ChatSessions { get; set; } = [];
public virtual ICollection<Document> Documents { get; set; } = [];
public virtual ICollection<FlashcardSet> FlashcardSets { get; set; } = [];
public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = [];
```

---

### ARC-12: Tính năng Token Refresh bị bỏ hoang (Dead Feature) & Hardcoded Token Lifetime trong AuthResponse
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 180-204)
  - `src/PRN212.AIStudyHub.WebAPI/Controllers/AuthController.cs`
  - `src/PRN212.AIStudyHub.Domain/Entities/RefreshToken.cs`
- **Nguyên nhân:**
  1. **Thiếu Endpoint đổi Refresh Token:** `AuthService.GenerateAuthResponseAsync` tạo chuỗi ngẫu nhiên cryptographically-strong 64-byte `refreshToken`, lưu vào cơ sở dữ liệu (bảng `RefreshToken`) với thời hạn 7 ngày và trả về cho client trong `AuthResponse`. Tuy nhiên, trong toàn bộ hệ thống backend KHÔNG HỀ TỒN TẠI endpoint (như `POST /api/v1/auth/refresh-token`) hoặc phương thức nghiệp vụ nào để đổi Refresh Token lấy Access Token mới!
  2. **Bảng dữ liệu chết (Zombie Table):** Cứ mỗi lần người dùng đăng nhập, một bản ghi mới được chèn vào bảng `RefreshToken`, nhưng không có một dòng code nào đọc hoặc sử dụng lại các token này. Khi JWT Access Token hết hạn (60 phút), người dùng buộc phải đăng nhập lại từ đầu bằng tài khoản/mật khẩu.
  3. **Hardcoded Token Lifetime:** Dòng 203: `new AuthResponse(accessToken, refreshToken, "Bearer", 3600, userDto);` gán cứng giá trị `3600` (giây) vào trường `ExpiresIn`, hoàn toàn không phụ thuộc vào giá trị cấu hình thực tế trong `JwtSettings.ExpiryInMinutes`.
- **Hậu quả tiềm ẩn:**
  Bảng `RefreshToken` nhanh chóng bị phình to dữ liệu rác không có giá trị sử dụng. Phá vỡ luồng người dùng tiêu chuẩn của SPA/Mobile app và báo sai thời gian hết hạn cho client.
- **Hướng dẫn khắc phục:**
  1. Thêm phương thức `Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request, CancellationToken cancellationToken)` vào `IAuthService` và controller endpoint.
  2. Áp dụng kỹ thuật Refresh Token Rotation: khi đổi token thành công, revoke token cũ (`IsRevoked = true`) và cấp cặp Access Token + Refresh Token mới.
  3. Tính toán động: `expiresIn: _jwtSettings.ExpiryInMinutes * 60`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
// Không có phương thức Refresh Token, thời hạn bị gán cứng
return new AuthResponse(accessToken, refreshToken, "Bearer", 3600, userDto);
```

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
public async Task<AuthResponse> RefreshTokenAsync(
    string refreshToken, 
    CancellationToken cancellationToken = default)
{
    var existingToken = await context.RefreshTokens
        .Include(r => r.User)
        .FirstOrDefaultAsync(r => r.Token == refreshToken, cancellationToken)
        ?? throw new UnauthorizedException("Invalid refresh token.");

    if (existingToken.IsRevoked || existingToken.ExpiresAt <= DateTime.UtcNow)
    {
        throw new UnauthorizedException("Refresh token is expired or revoked.");
    }

    if (!existingToken.User.IsActive)
    {
        throw new UnauthorizedException("User account is inactive.");
    }

    // Refresh Token Rotation: Thu hồi token cũ để ngăn chặn Replay Attack
    existingToken.IsRevoked = true;
    
    // Cấp phát cặp token mới
    return await GenerateAuthResponseAsync(existingToken.User, cancellationToken);
}

private async Task<AuthResponse> GenerateAuthResponseAsync(AppUser user, CancellationToken cancellationToken)
{
    string accessToken = jwtTokenGenerator.GenerateToken(user);
    string refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    RefreshToken refreshTokenEntity = new RefreshToken
    {
        UserId = user.Id,
        Token = refreshToken,
        ExpiresAt = DateTime.UtcNow.AddDays(7),
        IsRevoked = false,
        CreatedAt = DateTime.UtcNow
    };

    context.RefreshTokens.Add(refreshTokenEntity);
    await context.SaveChangesAsync(cancellationToken);

    UserDto userDto = new UserDto(
        user.Id, user.Email, user.FirstName, user.LastName, user.Role, user.IsActive, user.CreatedAt, user.UpdatedAt);

    // Tính toán chuẩn xác theo cấu hình
    int expiresInSeconds = jwtSettings.ExpiryInMinutes * 60;
    return new AuthResponse(accessToken, refreshToken, "Bearer", expiresInSeconds, userDto);
}

// 2. DTO mới trong src/PRN212.AIStudyHub.Application/DTOs/Auth/RefreshTokenRequest.cs:
public record RefreshTokenRequest(string RefreshToken);

// 3. Endpoint mới trong src/PRN212.AIStudyHub.WebAPI/Controllers/AuthController.cs:
[HttpPost("refresh-token")]
[AllowAnonymous]
[ProducesResponseType(typeof(ApiResponse<AuthResponse>), StatusCodes.Status200OK)]
[ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request, CancellationToken cancellationToken)
{
    var result = await authService.RefreshTokenAsync(request.RefreshToken, cancellationToken);
    return Ok(ApiResponse<AuthResponse>.SuccessResponse(result, "Token refreshed successfully."));
}
```

---

### ARC-13: Lỗi lệch khớp Case-Sensitive trong Cache Key & Thiếu chuẩn hóa Email
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 55, 75, 100, 118, 143, 329, 332, 365, 375)
- **Nguyên nhân:**
  Trong toàn bộ các luồng `Register`, `VerifyOtp`, `Login`, `ForgotPassword`, và `ResetPassword`, chuỗi `email` không bao giờ được chuẩn hóa (`.Trim().ToLowerInvariant()`).
  - Trong SQL Server: Collation mặc định không phân biệt hoa thường (`user@gmail.com` == `User@Gmail.com`).
  - Trong .NET `IMemoryCache`: Cache key là chuỗi C# so sánh phân biệt hoa thường (Ordinal Case-Sensitive).
- **Hậu quả tiềm ẩn:**
  Nếu người dùng đăng ký hoặc xin mã OTP bằng `NguyenVanA@gmail.com` (do bàn phím điện thoại tự động viết hoa chữ cái đầu), nhưng khi nhập xác thực OTP hoặc đổi mật khẩu lại gõ `nguyenvana@gmail.com`, `IMemoryCache.TryGetValue` sẽ trả về `false`. Hệ thống báo lỗi "Mã OTP đã hết hạn hoặc chưa được yêu cầu", khiến người dùng bị khóa bên ngoài tài khoản dù nhập đúng mã OTP.
- **Hướng dẫn khắc phục:**
  Tạo hàm chuẩn hóa `NormalizeEmail(string email) => email.Trim().ToLowerInvariant();` và áp dụng nhất quán trước khi lưu vào DB hoặc tra cứu Cache.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
var cacheKey = $"OTP_{request.Email}"; // Case-sensitive miss nếu lệch chữ hoa/thường
_ = cache.Set(cacheKey, new OtpCacheEntry(request, otp), cacheEntryOptions);
```

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

var normalizedEmail = NormalizeEmail(request.Email);
var cacheKey = $"OTP_REG_{normalizedEmail}";
_ = cache.Set(cacheKey, new OtpCacheEntry(request with { Email = normalizedEmail }, otp), cacheEntryOptions);
```

---

### ARC-14: Thiếu Quản trị Giao dịch Đa bước (Missing Database Transactions & Non-Atomic Operations)
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 141-155, 309-323)
- **Nguyên nhân:**
  Các thao tác nghiệp vụ phức tạp gồm nhiều bước ghi dữ liệu phụ thuộc lẫn nhau:
  - `CompleteGoogleRegistration`: Bước 1 tạo `AppUser` và gọi `SaveChangesAsync()`. Bước 2 gọi `GenerateAuthResponseAsync` tạo `RefreshToken` và gọi `SaveChangesAsync()` lần thứ hai.
  - Cả hai bước đều không được bao bọc trong một Database Transaction (`IDbContextTransaction`).
- **Hậu quả tiềm ẩn:**
  Nếu Bước 2 gặp sự cố (mất kết nối DB, vi phạm ràng buộc dữ liệu), Bước 1 đã được commit vĩnh viễn vào cơ sở dữ liệu. Kết quả là tạo ra một tài khoản người dùng mồ côi (`AppUser` không có token phiên làm việc), và khi người dùng thử lại qua Google thì hệ thống báo lỗi không thể hoàn tất.
- **Hướng dẫn khắc phục:**
  Gom các thao tác vào một đơn vị công việc (Unit of Work) duy nhất với 1 lần gọi `SaveChangesAsync()` hoặc sử dụng Execution Strategy và `BeginTransactionAsync()`.

#### Minh họa Refactor (Before / After):

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
// Gom AppUser và RefreshToken vào cùng một transaction để đảm bảo tính nguyên tử (Atomicity)
AppUser newUser = new AppUser
{
    Email = email,
    FirstName = firstName,
    LastName = lastName,
    PasswordHash = passwordHasher.HashPassword(Guid.NewGuid().ToString()),
    Role = request.Role,
    IsActive = true
};
context.AppUsers.Add(newUser);

// Chuẩn bị token ngay trong cùng transaction
string accessToken = jwtTokenGenerator.GenerateToken(newUser);
string refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

RefreshToken rt = new RefreshToken
{
    User = newUser, // Gán Navigation Property
    Token = refreshToken,
    ExpiresAt = DateTime.UtcNow.AddDays(7),
    IsRevoked = false
};
context.RefreshTokens.Add(rt);

// Commit toàn bộ trong 1 transaction duy nhất
await context.SaveChangesAsync(cancellationToken);
```

---

### ARC-15: Xung đột Không gian Khóa Bộ nhớ đệm (Cache Key Collision & Type Confusion) giữa Đăng ký và Quên mật khẩu
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 75, 118, 332, 365)
- **Nguyên nhân:**
  Cả hai phương thức `Register` và `ForgotPassword` đều sử dụng chung một định dạng cache key:
  - `Register`: `cache.Set($"OTP_{request.Email}", new OtpCacheEntry(request, otp))` (Lưu kiểu object `OtpCacheEntry`)
  - `ForgotPassword`: `cache.Set($"OTP_{request.email}", otp)` (Lưu kiểu nguyên thủy `string`)
  Hai tính năng dùng chung một định dạng key nhưng lưu hai kiểu dữ liệu hoàn toàn khác nhau mà không có tiền tố phân định mục đích (Purpose Prefix).
- **Hậu quả tiềm ẩn:**
  1. **Ghi đè dữ liệu (Race Condition / Overwrite):** Nếu một người dùng đang xác thực đăng ký tài khoản nhưng có một request quên mật khẩu gửi đến cho cùng email đó, key sẽ bị ghi đè thành kiểu `string`. Khi người dùng gọi `VerifyOtp`, `cache.TryGetValue(key, out OtpCacheEntry? entry)` sẽ thất bại hoặc ném ngoại lệ ép kiểu (`InvalidCastException`).
  2. **Type Confusion:** Ngược lại, nếu trong cache đang là `OtpCacheEntry`, hàm `ResetPassword` gọi `cache.TryGetValue(..., out string? savedOtp)` sẽ trả về `false`, khiến người dùng không thể đổi mật khẩu dù nhập đúng OTP.
- **Hướng dẫn khắc phục:**
  Tách biệt hoàn toàn namespace của Cache Key:
  - Đăng ký tài khoản: `$"OTP_REGISTER_{normalizedEmail}"`
  - Đặt lại mật khẩu: `$"OTP_RESETPWD_{normalizedEmail}"`

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
// Đăng ký lưu OtpCacheEntry:
_ = cache.Set($"OTP_{request.Email}", new OtpCacheEntry(request, otp), ...);

// Quên mật khẩu ghi đè thành chuỗi string:
_ = cache.Set($"OTP_{request.email}", otp, ...);
```

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
// Tiền tố riêng biệt, an toàn tuyệt đối về không gian tên và kiểu dữ liệu
private static string GetRegisterOtpCacheKey(string email) => $"OTP_REGISTER_{email.Trim().ToLowerInvariant()}";
private static string GetPasswordResetOtpCacheKey(string email) => $"OTP_RESETPWD_{email.Trim().ToLowerInvariant()}";

// Trong Register:
cache.Set(GetRegisterOtpCacheKey(request.Email), new OtpCacheEntry(request, otp), cacheEntryOptions);

// Trong ForgotPassword:
cache.Set(GetPasswordResetOtpCacheKey(userInDb.Email), otp, cacheEntryOptions);
```

---

### ARC-16: Nguy cơ Replay Token Tạm thời (Unprotected Replay of Temporary Google Onboarding Token)
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 281-323)
- **Nguyên nhân:**
  Trong `AuthService.CompleteGoogleRegistration`, token `tempToken` được xác thực bằng `jwtTokenGenerator.ValidateTemporaryToken(tempToken)`. Tuy nhiên, sau khi hoàn tất tạo tài khoản và sinh phiên đăng nhập, `tempToken` không hề bị đánh dấu thu hồi (revoked / blacklisted). Token này có thời hạn sống 5 phút.
- **Hậu quả tiềm ẩn:**
  Trong khung thời gian 5 phút, bất kỳ ai chặn bắt hoặc sở hữu `tempToken` đều có thể gọi lại API `CompleteGoogleRegistration` nhiều lần liên tiếp để nhận về các cặp Access Token / Refresh Token mới mà không cần xác thực lại danh tính.
- **Hướng dẫn khắc phục:**
  1. Thêm claim `Jti` cho `tempToken`.
  2. Ngay sau khi hoàn tất đăng ký, đưa `Jti` của `tempToken` vào Distributed/Memory Cache để đảm bảo token chỉ được sử dụng duy nhất 1 lần (Single-Use Token).

#### Minh họa Refactor (Before / After):

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
var principal = jwtTokenGenerator.ValidateTemporaryToken(tempToken) 
    ?? throw new UnauthorizedException("Temporary token is invalid or expired.");

var jti = principal.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
if (!string.IsNullOrEmpty(jti) && cache.TryGetValue($"UsedTempToken_{jti}", out _))
{
    throw new UnauthorizedException("Temporary token has already been consumed.");
}

... // Thực hiện tạo AppUser và cấp phát AuthResponse

// Đánh dấu token đã được sử dụng (vô hiệu hóa Replay)
if (!string.IsNullOrEmpty(jti))
{
    cache.Set($"UsedTempToken_{jti}", true, TimeSpan.FromMinutes(5));
}
```

---

## NHÓM 3: CODE DƯ THỪA VÀ TỐI ƯU HÓA HIỆU NĂNG (DEAD CODE & OPTIMIZATION)

### OPT-01: Gói thư viện phụ thuộc dư thừa và không tương thích trong PRN212.AIStudyHub.Application.csproj
- **Mức độ nghiêm trọng:** `High`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/PRN212.AIStudyHub.Application.csproj` (Dòng 8, 10, 12)
- **Nguyên nhân:**
  Tệp dự án `PRN212.AIStudyHub.Application.csproj` chứa các PackageReference:
  1. `Microsoft.AspNetCore.Mvc.Abstractions Version="2.3.12"`: Đây là thư viện của ASP.NET Core 2.x từ nhiều năm trước. Trong .NET 10, toàn bộ abstractions đã nằm trong Shared Framework của Web SDK. Một Class Library như `Application` hoàn toàn không được tham chiếu package 2.x cổ xưa này.
  2. `BCrypt.Net-Next Version="4.2.0"`: Tầng `Application` chỉ khai báo `IPasswordHasher`. Việc cài đặt mã hóa bằng BCrypt nằm ở `Infrastructure`. Package này bị dư thừa tại `Application`.
  3. `Microsoft.Extensions.Configuration Version="10.0.11"`: Sai lệch minor version (trong khi EF Core là 10.0.10) và không cần thiết nếu dùng Options Pattern.
- **Hậu quả tiềm ẩn:**
  Làm phình kích thước build artifact, kéo theo các package chuyển tiếp (transitive dependencies) lỗi thời có thể chứa lỗ hổng bảo mật đã biết (vulnerabilities).
- **Hướng dẫn khắc phục:**
  Loại bỏ các package thừa khỏi `PRN212.AIStudyHub.Application.csproj`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/PRN212.AIStudyHub.Application.csproj`):**
```xml
<ItemGroup>
  <PackageReference Include="BCrypt.Net-Next" Version="4.2.0" />
  <PackageReference Include="Google.Apis.Auth" Version="1.76.0" />
  <PackageReference Include="Microsoft.AspNetCore.Mvc.Abstractions" Version="2.3.12" />
  <PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.0.10" />
  <PackageReference Include="Microsoft.Extensions.Configuration" Version="10.0.11" />
</ItemGroup>
```

**After (`src/PRN212.AIStudyHub.Application/PRN212.AIStudyHub.Application.csproj`):**
```xml
<ItemGroup>
  <PackageReference Include="Google.Apis.Auth" Version="1.76.0" />
  <PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.0.10" />
  <PackageReference Include="Microsoft.Extensions.Caching.Abstractions" Version="10.0.0" />
  <PackageReference Include="Microsoft.Extensions.Options" Version="10.0.0" />
</ItemGroup>
```

---

### OPT-02: Dead Code - Lớp GoogleUserInfo.cs bị bỏ hoang do parse JSON thủ công
- **Mức độ nghiêm trọng:** `Low`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Application/DTOs/Auth/GoogleUserInfo.cs` (Dòng 1-14)
  - `src/PRN212.AIStudyHub.Application/Services/AuthService.cs` (Dòng 230-238)
- **Nguyên nhân:**
  Lớp `GoogleUserInfo` được định nghĩa đầy đủ với các attribute `[JsonPropertyName("email")]`, `[JsonPropertyName("name")]`. Tuy nhiên, trong `AuthService.GoogleLogin`, lập trình viên lại không dùng `JsonSerializer.Deserialize<GoogleUserInfo>(jsonResponse)` mà lại viết code phân tích thủ công bằng `JsonDocument` và `root.TryGetProperty("email", out ...)`.
- **Hậu quả tiềm ẩn:**
  Tạo ra dead code không sử dụng, làm code trong `AuthService` trở nên dài dòng và khó bảo trì.
- **Hướng dẫn khắc phục:**
  Sử dụng trực tiếp `JsonSerializer.Deserialize<GoogleUserInfo>(...)` với `GoogleUserInfo` hoặc xóa bỏ tệp nếu không cần.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
var jsonResponse = await response.Content.ReadAsStringAsync(cancellationToken);
using JsonDocument docs = System.Text.Json.JsonDocument.Parse(jsonResponse);
var root = docs.RootElement;
userEmail = root.TryGetProperty("email", out var emailEl) ? emailEl.GetString() ?? "" : "";
userName = root.TryGetProperty("name", out var nameEl) ? nameEl.GetString() ?? "" : "";
firstName = root.TryGetProperty("given_name", out var givenNameEl) ? givenNameEl.GetString() ?? userName : userName;
lastName = root.TryGetProperty("family_name", out var familyNameEl) ? familyNameEl.GetString() ?? "" : "";
```

**After (`src/PRN212.AIStudyHub.Application/Services/AuthService.cs`):**
```csharp
var userInfo = await response.Content.ReadFromJsonAsync<GoogleUserInfo>(cancellationToken)
    ?? throw new UnauthorizedException("Failed to parse Google user information.");

userEmail = userInfo.Email;
userName = userInfo.Name;
firstName = !string.IsNullOrEmpty(userInfo.GivenName) ? userInfo.GivenName : userInfo.Name;
lastName = userInfo.FamilyName ?? "";
```

---

### OPT-03: Cấp phát bộ nhớ thừa thãi do khởi tạo JsonSerializerOptions liên tục trong Middleware
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.WebAPI/Middlewares/GlobalExceptionMiddleware.cs` (Dòng 74-77)
- **Nguyên nhân:**
  Mỗi lần middleware xử lý một ngoại lệ, một instance `JsonSerializerOptions` mới lại được khởi tạo trên heap:
  ```csharp
  JsonSerializerOptions jsonOptions = new JsonSerializerOptions
  {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase
  };
  ```
- **Hậu quả tiềm ẩn:**
  Trong .NET, `JsonSerializerOptions` là một đối tượng rất nặng vì nó khởi tạo và lưu cache metadata của các serializer converters. Khởi tạo liên tục trên mỗi lượt request lỗi gây áp lực nặng nề lên Garbage Collector (GC Gen 0/1 allocation).
- **Hướng dẫn khắc phục:**
  Khai báo `JsonSerializerOptions` thành một trường `private static readonly JsonSerializerOptions JsonOptions` dùng chung duy nhất trong middleware.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.WebAPI/Middlewares/GlobalExceptionMiddleware.cs`):**
```csharp
JsonSerializerOptions jsonOptions = new JsonSerializerOptions
{
  PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};
await context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
```

**After (`src/PRN212.AIStudyHub.WebAPI/Middlewares/GlobalExceptionMiddleware.cs`):**
```csharp
private static readonly JsonSerializerOptions SerializerOptions = new()
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
};

...
await context.Response.WriteAsync(JsonSerializer.Serialize(response, SerializerOptions));
```

---

### OPT-04: Regex Compilation Overhead và xung đột từ chối domain kiểm thử hợp lệ
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Application/Utils/ValidationUtils.cs` (Dòng 14-26)
  - `src/PRN212.AIStudyHub.WebAPI/PRN212.AIStudyHub.WebAPI.http` (Dòng 13, 26, 49)
- **Nguyên nhân:**
  1. **Regex Compilation Overhead:** Hàm `Regex.IsMatch` được gọi trực tiếp bằng chuỗi tĩnh. Trên mỗi request kiểm tra email hoặc họ tên, biểu thức Regex phải được parse và compile lại từ đầu.
  2. **Xung đột từ chối domain kiểm thử của chính tác giả:** Regex chỉ cho phép cứng 4 domain (`gmail.com`, `hotmail.com`, `outlook.com`, `yahoo.com`). Trong khi đó, tệp kiểm thử `PRN212.AIStudyHub.WebAPI.http` của chính dự án lại dùng email mẫu `student@aistudyhub.com`. Kết quả là chính tệp test của dự án sẽ bị hàm kiểm tra từ chối hoàn toàn với lỗi "Invalid email format."! Ngoài ra, email trường học của sinh viên (`@fpt.edu.vn`) cũng bị chặn hoàn toàn.
- **Hậu quả tiềm ẩn:**
  Tốn CPU lặp đi lặp lại để parse regex, và ngăn cản sinh viên/giảng viên sử dụng email trường học hoặc email domain tùy chỉnh.
- **Hướng dẫn khắc phục:**
  Sử dụng C# Source Generator `[GeneratedRegex]` với `RegexOptions.IgnoreCase` và cấu hình timeout để chống ReDoS. Cho phép định dạng email hợp chuẩn RFC hoặc whitelist mở rộng.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Utils/ValidationUtils.cs`):**
```csharp
public static bool IsValidEmail(string email)
{
    if (string.IsNullOrEmpty(email)) return false;
    string emailPattern = @"^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com)$";
    return Regex.IsMatch(email, emailPattern, RegexOptions.IgnoreCase);
}
```

**After (`src/PRN212.AIStudyHub.Application/Utils/ValidationUtils.cs` - Tận dụng C# 13 Source Generator):**
```csharp
public static partial class ValidationUtils
{
    // C# Source Generator sinh mã biên dịch trước tại compile-time, zero allocation, an toàn ReDoS
    [GeneratedRegex(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", RegexOptions.IgnoreCase, matchTimeoutMilliseconds: 200)]
    private static partial Regex EmailRegex();

    [GeneratedRegex(@"^[\p{L}\s]+$", RegexOptions.None, matchTimeoutMilliseconds: 200)]
    private static partial Regex NameRegex();

    public static bool IsValidEmail(string? email)
    {
        return !string.IsNullOrWhiteSpace(email) && EmailRegex().IsMatch(email.Trim());
    }

    public static bool IsValidName(string? name)
    {
        return !string.IsNullOrWhiteSpace(name) && NameRegex().IsMatch(name.Trim());
    }
}
```

---

### OPT-05: Trùng lặp code khởi tạo DocumentResponseDto (6 lần lặp) trong DocumentService
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Application/Services/DocumentService.cs` (Dòng 54-66, 108-120, 167-179, 206-218, 245-257, 322-335)
- **Nguyên nhân:**
  Trong `DocumentService.cs`, khối khởi tạo `DocumentResponseDto` gồm 12 trường dữ liệu:
  ```csharp
  new DocumentResponseDto(
      doc.Id, doc.Title, doc.FileName, doc.StoragePath, doc.CloudPublicId,
      doc.IsCloudStored, doc.FileSize, doc.FileExtension, doc.ContentType,
      doc.UploadedAt, doc.IsPublic, doc.SubjectId)
  ```
  bị sao chép y hệt (copy-paste) tại 6 phương thức khác nhau: `UploadDocument`, `GetDocumentById`, `UpdateDocument`, `UpdateDocumentSubject`, `GetDocumentsBySubject`, và `GetDocuments`.
- **Hậu quả tiềm ẩn:**
  Vi phạm nguyên lý DRY (Don't Repeat Yourself). Khi thực thể `Document` hoặc `DocumentResponseDto` thêm hoặc đổi thứ tự một trường, lập trình viên phải sửa thủ công tại 6 vị trí khác nhau, nguy cơ cao xảy ra lỗi gán sai trường dữ liệu.
- **Hướng dẫn khắc phục:**
  Bổ sung static factory method `FromEntity(Document doc)` và biểu thức LINQ Projection `Expression<Func<Document, DocumentResponseDto>> Selector` vào `DocumentResponseDto`.

#### Minh họa Refactor (Before / After):

**After (`src/PRN212.AIStudyHub.Application/DTOs/Document/DocumentResponseDto.cs`):**
```csharp
public record DocumentResponseDto(
    Guid Id, string Title, string FileName, string StoragePath, string? CloudPublicId,
    bool IsCloudStored, long FileSize, string FileExtension, string ContentType,
    DateTime UploadedAt, bool IsPublic, Guid SubjectId)
{
    public static DocumentResponseDto FromEntity(Domain.Entities.Document doc) => new(
        doc.Id, doc.Title, doc.FileName, doc.StoragePath, doc.CloudPublicId,
        doc.IsCloudStored, doc.FileSize, doc.FileExtension, doc.ContentType,
        doc.UploadedAt, doc.IsPublic, doc.SubjectId);

    // Biểu thức Selector tối ưu cho EF Core IQueryable.Select()
    public static Expression<Func<Domain.Entities.Document, DocumentResponseDto>> Selector =>
        doc => new DocumentResponseDto(
            doc.Id, doc.Title, doc.FileName, doc.StoragePath, doc.CloudPublicId,
            doc.IsCloudStored, doc.FileSize, doc.FileExtension, doc.ContentType,
            doc.UploadedAt, doc.IsPublic, doc.SubjectId);
}
```

---

### OPT-06: Wrapper Class thừa AistudyHubDbContext.Custom.cs do scaffold DbSet số ít
- **Mức độ nghiêm trọng:** `Low`
- **Vị trí tệp:** `src/PRN212.AIStudyHub.Infrastructure/Data/AistudyHubDbContext.Custom.cs` (Dòng 1-22)
- **Nguyên nhân:**
  Khi scaffold database bằng lệnh EF Core CLI mà không có cờ `--pluralize`, các thuộc tính DbSet trong `AistudyHubDbContext.cs` bị đặt tên số ít (`public virtual DbSet<AppUser> AppUser { get; set; }`). Để chữa cháy cho giao diện `IAppDbContext` (vốn khai báo tên số nhiều `AppUsers`), một tệp `AistudyHubDbContext.Custom.cs` được tạo thêm chỉ để làm cầu nối alias (`public DbSet<AppUser> AppUsers => AppUser;`).
- **Hậu quả tiềm ẩn:**
  Tồn tại 2 bộ thuộc tính cho cùng một tập thực thể trong cùng một DbContext, gây nhầm lẫn khi viết query (lúc dùng `AppUser`, lúc dùng `AppUsers`).
- **Hướng dẫn khắc phục:**
  Chuẩn hóa trực tiếp tên DbSet trong `AistudyHubDbContext.cs` thành số nhiều và xóa hoàn toàn tệp `AistudyHubDbContext.Custom.cs`.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Infrastructure/Data/AistudyHubDbContext.cs` & `AistudyHubDbContext.Custom.cs`):**
```csharp
// Trong AistudyHubDbContext.cs:
public partial class AistudyHubDbContext(DbContextOptions<AistudyHubDbContext> options) : DbContext(options)
{
    public virtual DbSet<AppUser> AppUser { get; set; }
    public virtual DbSet<Document> Document { get; set; }
    ...
}

// Trong AistudyHubDbContext.Custom.cs (Wrapper Class thừa):
public partial class AistudyHubDbContext : IAppDbContext
{
    public DbSet<AppUser> AppUsers => AppUser;
    public DbSet<Document> Documents => Document;
    ...
}
```

**After (`src/PRN212.AIStudyHub.Infrastructure/Data/AistudyHubDbContext.cs` - Xóa bỏ tệp .Custom.cs):**
```csharp
// Kế thừa trực tiếp IAppDbContext và chuẩn hóa tên DbSet thành số nhiều
public partial class AistudyHubDbContext(DbContextOptions<AistudyHubDbContext> options) : DbContext(options), IAppDbContext
{
    public virtual DbSet<AppUser> AppUsers { get; set; }
    public virtual DbSet<ChatMessage> ChatMessages { get; set; }
    public virtual DbSet<ChatSession> ChatSessions { get; set; }
    public virtual DbSet<ChatSessionDocument> ChatSessionDocuments { get; set; }
    public virtual DbSet<Document> Documents { get; set; }
    public virtual DbSet<DocumentSummary> DocumentSummaries { get; set; }
    public virtual DbSet<FlashcardItem> FlashcardItems { get; set; }
    public virtual DbSet<FlashcardSet> FlashcardSets { get; set; }
    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }
    public virtual DbSet<Subject> Subjects { get; set; }
    ...
}
```

---

### OPT-07: Thiếu phân trang và cạn kiệt bộ nhớ tiềm ẩn trong API GetAllSubjects
- **Mức độ nghiêm trọng:** `Low`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.Application/Services/SubjectService.cs` (Dòng 40-47)
  - `src/PRN212.AIStudyHub.WebAPI/Controllers/SubjectController.cs` (Dòng 20-25)
- **Nguyên nhân:**
  Phương thức `GetAllSubjects` tải toàn bộ danh sách môn học vào bộ nhớ (`ToListAsync`) mà không áp dụng phân trang hoặc lưu vào Cache (In-Memory/Distributed Cache):
  ```csharp
  return await context.Subjects.AsNoTracking().OrderBy(s => s.Name).Select(...).ToListAsync(cancellationToken);
  ```
- **Hậu quả tiềm ẩn:**
  Khi dữ liệu môn học gia tăng quy mô (hàng ngàn môn theo chương trình đào tạo), API này sẽ tải toàn bộ danh mục lên bộ nhớ RAM của server trên mỗi lượt gọi, làm tăng chi phí GC và độ trễ phản hồi.
- **Hướng dẫn khắc phục:**
  Áp dụng caching cho danh mục môn học với thời gian sống hợp lý (ví dụ: 1 giờ với `IMemoryCache` hoặc `IDistributedCache`), tự động xóa cache khi có môn học mới được thêm vào.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.Application/Services/SubjectService.cs`):**
```csharp
public class SubjectService(IAppDbContext context) : ISubjectService
{
    public async Task<List<SubjectDto>> GetAllSubjects(CancellationToken cancellationToken = default)
    {
        // Truy vấn trực tiếp DB trên mỗi request, không có bộ đệm cache
        return await context.Subjects
            .AsNoTracking()
            .OrderBy(s => s.Name)
            .Select(s => new SubjectDto(s.Id, s.Name, s.Description, s.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
```

**After (`src/PRN212.AIStudyHub.Application/Services/SubjectService.cs`):**
```csharp
public class SubjectService(IAppDbContext context, IMemoryCache cache) : ISubjectService
{
    private const string SubjectsCacheKey = "Cache_AllSubjects";

    public async Task<SubjectDto> CreateSubject(CreateSubjectRequest request, CancellationToken cancellationToken = default)
    {
        ... // Tạo Subject mới
        _ = context.Subjects.Add(newSubject);
        await context.SaveChangesAsync(cancellationToken);

        // Xóa cache để đảm bảo dữ liệu không bị cũ (Cache Invalidation)
        cache.Remove(SubjectsCacheKey);
        return new SubjectDto(newSubject.Id, newSubject.Name, newSubject.Description, newSubject.CreatedAt);
    }

    public async Task<List<SubjectDto>> GetAllSubjects(CancellationToken cancellationToken = default)
    {
        return await cache.GetOrCreateAsync(SubjectsCacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return await context.Subjects
                .AsNoTracking()
                .OrderBy(s => s.Name)
                .Select(s => new SubjectDto(s.Id, s.Name, s.Description, s.CreatedAt))
                .ToListAsync(cancellationToken);
        }) ?? [];
    }
}
```

---

### OPT-08: Nghẽn băng thông kép và thắt nút cổ chai máy chủ khi tải tài liệu (Double Bandwidth Proxying Bottleneck)
- **Mức độ nghiêm trọng:** `Medium`
- **Vị trí tệp:**
  - `src/PRN212.AIStudyHub.WebAPI/Controllers/DocumentController.cs` (Dòng 193-208)
  - `src/PRN212.AIStudyHub.Application/Services/DocumentService.cs` (Dòng 341-366)
- **Nguyên nhân:**
  Trong `DocumentController.DownloadDocument`:
  ```csharp
  var result = await documentService.DownloadDocument(id, CurrentUserId, cancellationToken);
  return File(result.ContentStream, result.ContentType, result.FileName);
  ```
  Máy chủ WebAPI đóng vai trò trung gian tải toàn bộ tệp nhị phân từ Cloudinary về socket của server WebAPI, sau đó mới đẩy ngược lại từ WebAPI sang client. Trong khi đó, Cloudinary bản chất là một mạng phân phối nội dung toàn cầu (CDN) được tối ưu hóa riêng cho việc truyền tải tệp.
- **Hậu quả tiềm ẩn:**
  1. **Nghẽn băng thông kép (Double Bandwidth Cost):** Mỗi file 25MB tải về làm tiêu tốn 50MB băng thông máy chủ (25MB chiều Inbound từ Cloudinary + 25MB chiều Outbound đến Client).
  2. **Thắt nút cổ chai (Thread & Socket Exhaustion):** Hàng trăm người dùng tải tài liệu đồng thời sẽ chiếm dụng toàn bộ worker threads và socket của WebAPI, làm sập các API khác của hệ thống.
- **Hướng dẫn khắc phục:**
  Với các tài liệu được phép truy cập (công khai hoặc người dùng đã xác thực quyền sở hữu), controller nên trả về lệnh chuyển hướng HTTP 302 Redirect thẳng tới URL CDN của Cloudinary hoặc sinh Signed URL tạm thời với cờ `fl_attachment` để client tải trực tiếp từ CDN.

#### Minh họa Refactor (Before / After):

**Before (`src/PRN212.AIStudyHub.WebAPI/Controllers/DocumentController.cs`):**
```csharp
[HttpGet("{id:guid}/download")]
public async Task<IActionResult> DownloadDocument([FromRoute] Guid id, CancellationToken cancellationToken)
{
    // Stream toàn bộ file qua RAM máy chủ WebAPI
    var result = await documentService.DownloadDocument(id, CurrentUserId, cancellationToken);
    return File(result.ContentStream, result.ContentType, result.FileName);
}
```

**After (`src/PRN212.AIStudyHub.WebAPI/Controllers/DocumentController.cs`):**
```csharp
[HttpGet("{id:guid}/download")]
public async Task<IActionResult> DownloadDocument([FromRoute] Guid id, CancellationToken cancellationToken)
{
    // Xác thực quyền truy cập tài liệu
    var downloadInfo = await documentService.GetDocumentDownloadUrl(id, CurrentUserId, User.IsInRole("Admin"), cancellationToken);
    
    // Redirect thẳng client tới CDN Cloudinary có attachment flag, giảm tải 100% băng thông cho WebAPI
    return Redirect(downloadInfo.DownloadUrl);
}
```

---

## 5. LỘ TRÌNH VÀ HƯỚNG DẪN KHẮC PHỤC (REMEDIATION ROADMAP)

Để đảm bảo an toàn và tính liên tục của hệ thống, toàn bộ 36 phát hiện được phân chia theo 3 giai đoạn (Sprints):

### Giai đoạn 1: Hotfix Bảo mật Khẩn cấp (Sprint 1 - Priority P0)
- [ ] **SEC-01**: Rotate toàn bộ Secret Key (Cloudinary, JWT Secret), chuyển qua `dotnet user-secrets` và Environment Variables.
- [ ] **SEC-02**: Chặn privilege escalation trong `AuthService.Register` / `VerifyOtp`, vô hiệu hóa khả năng tự cấp quyền `Admin`.
- [ ] **SEC-03**: Thay thế `System.Random` bằng `RandomNumberGenerator.GetInt32` cho OTP.
- [ ] **SEC-07**: Bổ sung `[Authorize(Roles = "Admin,Lecturer")]` cho endpoint `CreateSubject`.
- [ ] **SEC-10**: Bổ sung làm sạch `FileName`, xác thực `Title` và kiểm tra Magic Bytes cho upload file; rollback file trên Cloudinary nếu DB lỗi.
- [ ] **SEC-11**: Mở rộng phân quyền Admin cho phép xem, tải và xóa các tài liệu vi phạm.
- [ ] **SEC-12**: Khắc phục User Enumeration trong `ForgotPassword`, luôn trả về thông báo chung đồng nhất.
- [ ] **ARC-02**: Bổ sung mục cấu hình `EmailSettings` vào `appsettings.json` để phục hồi tính năng Đăng ký & Quên mật khẩu.

### Giai đoạn 2: Tái cấu trúc Kiến trúc & Sửa lỗi Nghiệp vụ (Sprint 2 - Priority P1)
- [ ] **ARC-01**: Chuyển `EmailService` sang tầng `Infrastructure`, thay thế `SmtpClient` cũ bằng `MailKit`.
- [ ] **ARC-12**: Xây dựng endpoint `POST /api/v1/auth/refresh-token`, cơ chế Refresh Token Rotation và tính toán động `ExpiresIn`.
- [ ] **ARC-15**: Tách biệt tiền tố Cache Key giữa Đăng ký (`OTP_REGISTER_`) và Đặt lại mật khẩu (`OTP_RESETPWD_`).
- [ ] **SEC-04 & SEC-05**: Tách biệt luồng Temporary Token và hoàn thiện cơ chế thu hồi Refresh Token trên DB khi Logout.
- [ ] **ARC-03**: Đồng bộ tên cấu hình `ExpiryInMinutes` trong `JwtSettings.cs`.
- [ ] **ARC-04 & OPT-08**: Inject `IHttpClientFactory` cho `AuthService.GoogleLogin` và chuyển hướng download trực tiếp qua Cloudinary CDN.
- [ ] **ARC-13**: Chuẩn hóa chữ thường email (`.Trim().ToLowerInvariant()`) trước khi lưu trữ hoặc tra cứu Cache Key.
- [ ] **ARC-14**: Gom các luồng ghi đa bảng vào 1 giao dịch nguyên tử (Atomic Transaction).
- [ ] **ARC-16**: Vô hiệu hóa Replay Attack trên Temporary Token khi hoàn tất đăng ký Google.
- [ ] **SEC-09**: Kích hoạt cấu hình CORS an toàn kết nối với SPA frontend.
- [ ] **SEC-06**: Bổ sung số lần thử sai tối đa cho OTP và kích hoạt ASP.NET Core Rate Limiter.

### Giai đoạn 3: Tối ưu hóa Hiệu năng & Dọn dẹp Code (Sprint 3 - Priority P2)
- [ ] **OPT-01**: Xóa package `Microsoft.AspNetCore.Mvc.Abstractions` và `BCrypt` thừa trong `Application.csproj`.
- [ ] **OPT-02 & OPT-05**: Tái sử dụng `GoogleUserInfo` và áp dụng centralized mapping trong `DocumentResponseDto`.
- [ ] **ARC-06 & ARC-07**: Tối ưu LINQ query (xóa `.ToLower()` trên cột DB, bỏ `.Include()` thừa).
- [ ] **ARC-08**: Khai báo Global Query Filter `!d.IsDeleted` trong DbContext.
- [ ] **OPT-04**: Áp dụng C# Source Generator `[GeneratedRegex]` và mở rộng domain email cho sinh viên.
- [ ] **OPT-03**: Tối ưu `JsonSerializerOptions` static trong Middleware.
- [ ] **OPT-06**: Chuẩn hóa tên DbSet số nhiều và xóa bỏ tệp `AistudyHubDbContext.Custom.cs`.
- [ ] **OPT-07**: Cache danh mục môn học trong `GetAllSubjects`.

---

## 6. HƯỚNG DẪN CẤU HÌNH VÀ STATIC ANALYSIS AUTOMATION

Để ngăn ngừa các lỗi bảo mật và code smell tương tự trong tương lai, khuyến nghị tích hợp các công cụ tự động vào CI/CD Pipeline:

1. **Bật Microsoft .NET Code Analysis Rules trong `.editorconfig` hoặc `.csproj`:**
   ```xml
   <PropertyGroup>
     <EnableNETAnalyzers>true</EnableNETAnalyzers>
     <AnalysisLevel>latest-recommended</AnalysisLevel>
     <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
   </PropertyGroup>
   ```
2. **Quét rò rỉ Secrets tự động với Gitleaks:**
   Thêm pre-commit hook hoặc GitHub Action để phát hiện hardcoded credentials trước khi commit vào Git.
3. **Kiểm tra Dependencies với Dotnet Retire / Trivy:**
   Tự động cảnh báo các package lỗi thời hoặc có CVE bảo mật trong quá trình `dotnet restore`.
4. **Bổ sung Bộ kiểm thử tự động (Unit & Integration Tests):**
   Tạo các dự án test (`xUnit` / `NUnit` kết hợp `FluentAssertions`, `Moq` và `WebApplicationFactory`) để tự động kiểm tra các kịch bản xác thực, bảo mật phân quyền và xử lý dữ liệu.

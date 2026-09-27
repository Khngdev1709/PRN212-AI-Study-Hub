using System.Text;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using PRN212.AIStudyHub.Application.Interfaces;
using PRN212.AIStudyHub.Application.Interfaces.Cloud;
using PRN212.AIStudyHub.Application.Interfaces.Security;
using PRN212.AIStudyHub.Application.Services;
using PRN212.AIStudyHub.Infrastructure.Cloud;
using PRN212.AIStudyHub.Infrastructure.Data;
using PRN212.AIStudyHub.Infrastructure.Security;
using PRN212.AIStudyHub.WebAPI.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// =========================================================================
// DATABASE & DI CONTAINER CONFIGURATION
// =========================================================================
builder.Services.AddDbContext<AistudyHubDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAppDbContext>(provider =>
    provider.GetRequiredService<AistudyHubDbContext>());

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<CloudinarySettings>(
  builder.Configuration.GetSection(CloudinarySettings.SectionName));

builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICloudStorageService, CloudinaryStorageService>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddMemoryCache();

// =========================================================================
// JWT AUTHENTICATION CONFIGURATION
// =========================================================================
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("JwtSettings in Configuration/UserSecrets not found.");

var secretKey = Encoding.UTF8.GetBytes(jwtSettings.Secret);

builder.Services.AddAuthentication(options =>
{
  options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
  options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
  options.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = jwtSettings.Issuer,
    ValidAudience = jwtSettings.Audience,
    IssuerSigningKey = new SymmetricSecurityKey(secretKey),
    ClockSkew = TimeSpan.Zero
  };

  options.Events = new JwtBearerEvents
  {
    OnTokenValidated = context =>
    {
      var memoryCache = context.HttpContext.RequestServices.GetRequiredService<IMemoryCache>();
      var authHeader = context.Request.Headers.Authorization.ToString();
      if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
      {
        var token = authHeader["Bearer ".Length..].Trim();
        if (memoryCache.TryGetValue($"Blacklist_{token}", out _))
        {
          context.Fail("Token has been revoked/logged out.");
        }
      }
      return Task.CompletedTask;
    }
  };
});

builder.Services.AddAuthorization();
builder.Services.AddRouting(options => options.LowercaseUrls = true);
builder.Services.AddControllers();
builder.Services.AddHttpClient();

// =========================================================================
// SWAGGER / OPENAPI INCLUDE BEARER TOKEN CONFIGURATION
// =========================================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
  options.SwaggerDoc("v1", new OpenApiInfo
  {
    Title = "AI Study Hub RESTful API",
    Version = "v1",
    Description = "AI Study Hub API System Management"
  });

  options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
  {
    Name = "Authorization",
    Type = SecuritySchemeType.Http,
    Scheme = "Bearer",
    BearerFormat = "JWT",
    In = ParameterLocation.Header,
    Description = "Enter Access Token here: \nExample: eyJhbGciOi..."
  });

  options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
  {
    {
      new OpenApiSecuritySchemeReference("Bearer", document),
      new List<string>()
    }
  });
});

// =========================================================================
// MIDDLEWARE PIPELINE CONFIGURATION
// =========================================================================

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
  _ = app.UseSwagger();
  _ = app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

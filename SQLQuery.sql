USE trademate;
GO

CREATE TABLE dbo.Currencies (
    CurrencyCode CHAR(3) NOT NULL,
    CurrencyName NVARCHAR(100) NOT NULL,
    IsActive BIT NOT NULL
        CONSTRAINT DF_Currencies_IsActive DEFAULT 1,

    CONSTRAINT PK_Currencies
        PRIMARY KEY (CurrencyCode)
);
GO


INSERT INTO dbo.Currencies (CurrencyCode, CurrencyName)
VALUES
    ('INR', 'Indian Rupee'),
    ('USD', 'US Dollar'),
    ('EUR', 'Euro'),
    ('GBP', 'British Pound'),
    ('AED', 'UAE Dirham'),
    ('JPY', 'Japanese Yen'),
    ('AUD', 'Australian Dollar'),
    ('CAD', 'Canadian Dollar'),
    ('SGD', 'Singapore Dollar'),
    ('CHF', 'Swiss Franc');
GO

SELECT * FROM dbo.Currencies ORDER BY CurrencyCode;


CREATE TABLE dbo.ExchangeRates (
    RateDate DATE NOT NULL,
    CurrencyCode CHAR(3) NOT NULL,
    Rate DECIMAL(19, 10) NOT NULL,
    Source VARCHAR(50) NOT NULL
        CONSTRAINT DF_ExchangeRates_Source
        DEFAULT 'Frankfurter',
    FetchedAt DATETIME2 NOT NULL
        CONSTRAINT DF_ExchangeRates_FetchedAt
        DEFAULT SYSUTCDATETIME(),

    CONSTRAINT PK_ExchangeRates
        PRIMARY KEY (RateDate, CurrencyCode),

    CONSTRAINT FK_ExchangeRates_Currencies
        FOREIGN KEY (CurrencyCode)
        REFERENCES dbo.Currencies (CurrencyCode),

    CONSTRAINT CK_ExchangeRates_Rate
        CHECK (Rate > 0)
);
GO




--last
SELECT
    RateDate,
    CurrencyCode,
    Rate,
    Source,
    FetchedAt
FROM dbo.ExchangeRates
ORDER BY RateDate DESC, CurrencyCode;

SELECT
    CurrencyCode,
    COUNT(*) AS ObservationCount,
    MIN(RateDate) AS FirstDate,
    MAX(RateDate) AS LatestDate
FROM dbo.ExchangeRates
GROUP BY CurrencyCode
ORDER BY CurrencyCode;


WITH LatestRates AS (
    SELECT
        RateDate,
        CurrencyCode,
        Rate,
        ROW_NUMBER() OVER (
            PARTITION BY CurrencyCode
            ORDER BY RateDate DESC
        ) AS rn
    FROM dbo.ExchangeRates
)
SELECT RateDate, CurrencyCode, Rate
FROM LatestRates
WHERE rn = 1
ORDER BY CurrencyCode;


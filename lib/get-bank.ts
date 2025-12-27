export type SaudiBank = {
  name: string;
  logo: string;
};

export const FALLBACK_LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg";

export const SAUDI_BANK_BINS: Record<string, SaudiBank> = {
  // Al Rajhi Bank
  "458456": {
    name: "Al Rajhi Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/5a/Al_Rajhi_Bank_Logo.svg",
  },

  // Saudi National Bank (SNB)
  "410685": {
    name: "Saudi National Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/77/Saudi_National_Bank_Logo.svg",
  },
  "483010": {
    name: "Saudi National Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/77/Saudi_National_Bank_Logo.svg",
  },

  // Riyad Bank
  "440647": {
    name: "Riyad Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/8/8a/Riyad_Bank_logo.svg",
  },

  // SABB
  "468540": {
    name: "SABB Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/3/3c/SABB_logo.svg",
  },

  // Banque Saudi Fransi
  "421141": {
    name: "Banque Saudi Fransi",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/2a/Banque_Saudi_Fransi_logo.svg",
  },

  // Arab National Bank
  "428671": {
    name: "Arab National Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/2e/Arab_National_Bank_logo.svg",
  },

  // Alinma Bank
  "474491": {
    name: "Alinma Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/0/08/Alinma_Bank_logo.svg",
  },

  // SAIB
  "442463": {
    name: "Saudi Investment Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/6e/Saudi_Investment_Bank_logo.svg",
  },

  // Bank AlJazira
  "440795": {
    name: "Bank AlJazira",
    logo: "https://upload.wikimedia.org/wikipedia/en/9/97/Bank_AlJazira_logo.svg",
  },

  // Gulf International Bank (GIB)
  "431361": {
    name: "Gulf International Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/4/47/Gulf_International_Bank_logo.svg",
  },

  // STC Pay (Virtual Mada)
  "588845": {
    name: "STC Pay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3c/STC_Pay_logo.svg",
  },

  // D360 Bank
  "507568": {
    name: "D360 Bank",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/49/D360_Bank_logo.svg",
  },
};

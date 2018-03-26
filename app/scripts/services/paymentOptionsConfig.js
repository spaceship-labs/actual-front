(function() {
  "use strict";

  angular
    .module("actualApp")
    .factory("paymentOptionsConfig", paymentOptionsWrapper);

  function paymentOptionsWrapper() {
    var service = {
      getAll: getAll
    };

    function getAll() {
      return paymentOptions;
    }

    return service;
  }

  var paymentOptions = [
    //MASTER CARD(International)
    {
      card: { label: "Master Card", value: "master-card" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      isInternational: true,
      terminal: { label: "Banamex", value: "banamex" }
    },

    {
      card: { label: "Master Card", value: "master-card" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      isInternational: true,
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //VISA(International)
    {
      card: { label: "Visa", value: "visa" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      isInternational: true,
      terminal: { label: "Banamex", value: "banamex" }
    },

    {
      card: { label: "Visa", value: "visa" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      isInternational: true,
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //AMERICAN EXPRESS (International)
    {
      card: { label: "American Express", value: "american-express" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      isInternational: true,
      terminal: { label: "American Express", value: "american-express" }
    },

    //AMERICAN EXPRESS
    {
      card: { label: "American Express", value: "american-express" },
      paymentTypes: [
        "credit-card",
        "debit-card",
        "3-msi",
        "6-msi",
        "9-msi",
        "12-msi" /*,'18-msi'*/
      ],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "American Express", value: "american-express" }
    },

    //BANAMEX
    {
      card: { label: "Banamex", value: "banamex" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },

    {
      card: { label: "Banamex", value: "banamex" },
      paymentTypes: [
        "3-msi-banamex",
        "6-msi-banamex",
        "9-msi-banamex",
        "12-msi-banamex",
        "13-msi" /*,'18-msi'*/
      ],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },

    //Banamex for studio malecon
    {
      card: { label: "Banamex", value: "banamex" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //SANTANDER
    {
      card: { label: "Santander", value: "santander" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },

    {
      card: { label: "Santander", value: "santander" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Santander for studio malecon
    {
      card: { label: "Santander", value: "santander" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //BANCOMER
    {
      card: { label: "Bancomer", value: "bancomer" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },

    {
      card: { label: "Bancomer", value: "bancomer" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Bancomer", value: "bancomer" }
    },

    //Bancomer for studio malecon
    {
      card: { label: "Bancomer", value: "bancomer" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //BANORTE
    {
      card: { label: "Banorte", value: "banorte" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Banorte", value: "banorte" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Banorte for studio malecon
    {
      card: { label: "Banorte", value: "banorte" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //AFIRME
    {
      card: { label: "Afirme", value: "afirme" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Afirme", value: "afirme" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Afirme for studio malecon
    {
      card: { label: "Afirme", value: "afirme" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //BANBAJIO
    {
      card: { label: "Banbajio", value: "banbajio" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Banbajio", value: "banbajio" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Banbajio for studio malecon
    {
      card: { label: "Banbajio", value: "banbajio" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //BANCAMIFEL
    {
      card: { label: "Bancamifel", value: "bancamifel" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Bancamifel", value: "bancamifel" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Bancamifel form studio malecon
    {
      card: { label: "Bancamifel", value: "bancamifel" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    // BANCO AHORRO FAMSA
    {
      card: { label: "Banco Ahorro Famsa", value: "banco-ahorro-famsa" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Banco Ahorro Famsa", value: "banco-ahorro-famsa" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Banco ahorro famsa for studio malecon
    {
      card: { label: "Banco Ahorro Famsa", value: "banco-ahorro-famsa" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //BANJERCITO
    {
      card: { label: "Banjercito", value: "banjercito" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Banjercito", value: "banjercito" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Banjercito for studio malecon
    {
      card: { label: "Banjercito", value: "banjercito" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //BANREGIO
    {
      card: { label: "Banregio", value: "banregio" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Banregio", value: "banregio" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Banregio for studio malecon
    {
      card: { label: "Banregio", value: "banregio" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //HSBC
    {
      card: { label: "HSBC", value: "hsbc" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },

    {
      card: { label: "HSBC", value: "hsbc" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //HSBC for studio malecon
    {
      card: { label: "HSBC", value: "hsbc" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //INBURSA
    {
      card: { label: "Inbursa", value: "inbursa" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Inbursa", value: "inbursa" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Inbursa for studio malecon
    {
      card: { label: "Inbursa", value: "inbursa" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //INVEX
    {
      card: { label: "Invex Banco", value: "invex-banco" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Invex Banco", value: "invex-banco" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Invex for studio malecon
    {
      card: { label: "Invex Banco", value: "invex-banco" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //ITAUCARD
    {
      card: { label: "Itaucard", value: "itaucard" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "Itaucard", value: "itaucard" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Itaucard for studio malecon
    {
      card: { label: "Itaucard", value: "itaucard" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //IXE
    {
      card: { label: "IXE", value: "ixe" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "IXE", value: "ixe" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //IXE for studio malecon
    {
      card: { label: "IXE", value: "ixe" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //LIVERPOOL
    {
      card: {
        label: "Liverpool Premium Card",
        value: "liverpool-premium-card"
      },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: {
        label: "Liverpool Premium Card",
        value: "liverpool-premium-card"
      },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Liverpool for studio malecon
    {
      card: {
        label: "Liverpool Premium Card",
        value: "liverpool-premium-card"
      },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //SCOTIABANK
    {
      card: { label: "ScotiaBank", value: "scotiabank" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banamex", value: "banamex" }
    },
    {
      card: { label: "ScotiaBank", value: "scotiabank" },
      paymentTypes: ["3-msi", "6-msi", "9-msi", "12-msi"],
      storesTypes: ["home", "studio", "proyectos"],
      terminal: { label: "Banorte", value: "banorte" }
    },

    //Scotiabank for studio malecon
    {
      card: { label: "ScotiaBank", value: "scotiabank" },
      paymentTypes: ["credit-card", "debit-card"],
      storesTypes: ["studio"],
      storeCodes: ["actual_studio_malecon"],
      terminal: { label: "Banorte", value: "banorte" }
    }
  ];
})();

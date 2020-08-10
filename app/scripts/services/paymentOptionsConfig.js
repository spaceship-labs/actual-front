(function () {
  'use strict';

  angular
    .module('actualApp')
    .factory('paymentOptionsConfig', paymentOptionsWrapper);

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
      card: { label: 'Master Card', value: 'master-card' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      isInternational: true,
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Master Card', value: 'master-card' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['studio'],
      isInternational: true,
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banorte', value: 'banorte' }
    },

    //VISA(International)
    {
      card: { label: 'Visa', value: 'visa' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      isInternational: true,
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Visa', value: 'visa' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['studio'],
      isInternational: true,
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banorte', value: 'banorte' }
    },

    //AMERICAN EXPRESS (International)
    {
      card: { label: 'American Express', value: 'american-express' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      isInternational: true,
      terminal: { label: 'American Express', value: 'american-express' }
    },

    {
      card: { label: 'American Express', value: 'american-express' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      storeCodes: ['actual_studio_cumbres'],
      isInternational: true,
      terminal: { label: 'American Express', value: 'american-express' }
    },

    //AMERICAN EXPRESS
    {
      card: { label: 'American Express', value: 'american-express' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'American Express', value: 'american-express' }
    },

    //For studio cumbres
    {
      card: { label: 'American Express', value: 'american-express' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //BANAMEX
    {
      card: { label: 'Banamex', value: 'banamex' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Banamex for studio cumbres
    {
      card: { label: 'Banamex', value: 'banamex' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Banamex', value: 'banamex' },
      paymentTypes: [
        '3-msi-banamex',
        '6-msi-banamex',
        '9-msi-banamex',
        '12-msi-banamex',
        '13-msi' /*,'18-msi'*/
      ],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //SANTANDER
    {
      card: { label: 'Santander', value: 'santander' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Santander for studio cumbres
    {
      card: { label: 'Santander', value: 'santander' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Santander', value: 'santander' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //BANCOMER
    {
      card: { label: 'Bancomer', value: 'bancomer' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Bancomer for studio cumbres
    {
      card: { label: 'Bancomer', value: 'bancomer' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Bancomer', value: 'bancomer' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //BANORTE
    {
      card: { label: 'Banorte', value: 'banorte' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Banorte for studio cumbres
    {
      card: { label: 'Banorte', value: 'banorte' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Banorte', value: 'banorte' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //AFIRME
    {
      card: { label: 'Afirme', value: 'afirme' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Afirme for studio cumbres
    {
      card: { label: 'Afirme', value: 'afirme' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Afirme', value: 'afirme' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //BANBAJIO
    {
      card: { label: 'Banbajio', value: 'banbajio' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Banbajio for studio cumbres
    {
      card: { label: 'Banbajio', value: 'banbajio' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Banbajio', value: 'banbajio' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //BANCAMIFEL
    {
      card: { label: 'Bancamifel', value: 'bancamifel' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Bancamifel form studio cumbres
    {
      card: { label: 'Bancamifel', value: 'bancamifel' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Bancamifel', value: 'bancamifel' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    // BANCO AHORRO FAMSA
    {
      card: { label: 'Banco Ahorro Famsa', value: 'banco-ahorro-famsa' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Banco ahorro famsa for studio cumbres
    {
      card: { label: 'Banco Ahorro Famsa', value: 'banco-ahorro-famsa' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Banco Ahorro Famsa', value: 'banco-ahorro-famsa' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //BANJERCITO
    {
      card: { label: 'Banjercito', value: 'banjercito' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Banjercito for studio cumbres
    {
      card: { label: 'Banjercito', value: 'banjercito' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Banjercito', value: 'banjercito' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //BANREGIO
    {
      card: { label: 'Banregio', value: 'banregio' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Banregio for studio cumbres
    {
      card: { label: 'Banregio', value: 'banregio' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Banregio', value: 'banregio' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //HSBC
    {
      card: { label: 'HSBC', value: 'hsbc' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //HSBC for studio cumbres
    {
      card: { label: 'HSBC', value: 'hsbc' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'HSBC', value: 'hsbc' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //INBURSA
    {
      card: { label: 'Inbursa', value: 'inbursa' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Inbursa for studio cumbres
    {
      card: { label: 'Inbursa', value: 'inbursa' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Inbursa', value: 'inbursa' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //INVEX
    {
      card: { label: 'Invex Banco', value: 'invex-banco' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Invex for studio cumbres
    {
      card: { label: 'Invex Banco', value: 'invex-banco' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Invex Banco', value: 'invex-banco' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //ITAUCARD
    {
      card: { label: 'Itaucard', value: 'itaucard' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Itaucard for studio cumbres
    {
      card: { label: 'Itaucard', value: 'itaucard' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'Itaucard', value: 'itaucard' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //IXE
    {
      card: { label: 'IXE', value: 'ixe' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //IXE for studio cumbres
    {
      card: { label: 'IXE', value: 'ixe' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'IXE', value: 'ixe' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //LIVERPOOL
    {
      card: {
        label: 'Liverpool Premium Card',
        value: 'liverpool-premium-card'
      },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Liverpool for studio cumbres
    {
      card: {
        label: 'Liverpool Premium Card',
        value: 'liverpool-premium-card'
      },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: {
        label: 'Liverpool Premium Card',
        value: 'liverpool-premium-card'
      },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //SCOTIABANK
    {
      card: { label: 'ScotiaBank', value: 'scotiabank' },
      paymentTypes: ['credit-card', 'debit-card'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    //Scotiabank for studio cumbres
    {
      card: { label: 'ScotiaBank', value: 'scotiabank' },
      paymentTypes: [
        'credit-card',
        'debit-card',
        '3-msi',
        '6-msi',
        '9-msi',
        '12-msi',
        '18-msi'
      ],
      storesTypes: ['studio'],
      storeCodes: ['actual_studio_cumbres'],
      terminal: { label: 'Banamex', value: 'banamex' }
    },

    {
      card: { label: 'ScotiaBank', value: 'scotiabank' },
      paymentTypes: ['3-msi', '6-msi', '9-msi', '12-msi', '18-msi'],
      storesTypes: ['home', 'studio', 'proyectos'],
      terminal: { label: 'Banamex', value: 'banamex' }
    }
  ];
})();

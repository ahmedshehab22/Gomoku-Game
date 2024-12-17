class GameData {
    constructor(prefix = 'gomoku.') {
      this.prefix = prefix;
      this.records = {};
    }
  
    /**
     * Add a new record to the game data.
     * @param {string} name - The name of the record.
     * @param {any} defaultValue - The default value of the record.
     * @param {Function} applyFunc - A function to apply changes when the value is set.
     */
    addRecord(name, defaultValue, applyFunc = () => {}) {
      this.records[name] = defaultValue;
  
      Object.defineProperty(this, name, {
        get: () => localStorage.getItem(`${this.prefix}${name}`) || defaultValue,
        set: (val) => {
          applyFunc(val);
          localStorage.setItem(`${this.prefix}${name}`, val);
        },
      });
    }
  
    /**
     * Initialize the game data by setting default values.
     */
    initialize() {
      Object.keys(this.records).forEach((key) => {
        if (!localStorage.getItem(`${this.prefix}${key}`)) {
          this[key] = this.records[key];
        }
      });
    }
  
    /**
     * Apply changes by re-assigning the current values to trigger setters.
     */
    applyChanges() {
      Object.keys(this.records).forEach((key) => {
        this[key] = this[key]; // Trigger setter for each property.
      });
    }
  
    /**
     * Load game data from localStorage.
     */
    load() {
      if (!localStorage.getItem(`${this.prefix}firstTime`)) {
        this.initialize();
      }
      this.applyChanges();
    }
  }
  
  // Example usage:
  const gameData = new GameData();
  
  gameData.addRecord('firstTime', 'firstTime');
  gameData.addRecord('mode', 'vscomputer', (val) => {
    $('#mode-select input[value="' + val + '"]').attr('checked', true);
    $('#mode-select input[type="radio"]').checkboxradio('refresh');
    if (val === 'vshuman') {
      $('.vs-computer').hide();
    } else {
      $('.vs-computer').show();
    }
  });
  gameData.addRecord('color', 'black', (val) => {
    $('#color-select input[value="' + val + '"]').attr('checked', true);
    $('#color-select input[type="radio"]').checkboxradio('refresh');
  });
  gameData.addRecord('level', 'medium', (val) => {
    $('#level-select input[value="' + val + '"]').attr('checked', true);
    $('#level-select input[type="radio"]').checkboxradio('refresh');
  });
  
  // Load game data
  gameData.load();
  
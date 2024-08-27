import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Picker, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';

const currencyNames = {
  USD: 'Dólar dos EUA',
  EUR: 'Euro',
  GBP: 'Libra Esterlina',
  JPY: 'Iene Japonês',
  AUD: 'Dólar Australiano',
  CAD: 'Dólar Canadense',
  CHF: 'Franco Suíço',
  CNY: 'Yuan Chinês',
  SEK: 'Coroa Sueca',
  NZD: 'Dólar Neozelandês',
  BRL: 'Real Brasileiro',
};

const API_KEY = 'c5b68077b59a2e6da6bfba36';
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

export default function App() {
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await axios.get(BASE_URL);
        const availableCurrencies = Object.keys(response.data.conversion_rates);
        const filteredCurrencies = availableCurrencies.filter(currency => currencyNames[currency]);
        setCurrencies(filteredCurrencies);
        setRates(response.data.conversion_rates);
        setDate(response.data.time_last_update_utc);
        setLoading(false);
      } catch (error) {
        setError('Erro ao carregar moedas. Tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (amount && !isNaN(amount) && rates[baseCurrency] && rates[targetCurrency]) {
      const rate = rates[targetCurrency] / rates[baseCurrency];
      setConvertedAmount(amount * rate);
    } else {
      setConvertedAmount(null);
    }
  }, [amount, baseCurrency, targetCurrency, rates]);

  const formatAmount = (text) => {
    const formattedText = text.replace(/,/g, '.');
    return isNaN(formattedText) ? '' : formattedText;
  };

  const handleInvertCurrencies = () => {
    setBaseCurrency(targetCurrency);
    setTargetCurrency(baseCurrency);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.title}>Carregando...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Conversor de Moedas</Text>
      <Text style={styles.info}>
        Os valores são baseados nas taxas de câmbio: ({date})
      </Text>
      <View style={styles.inputContainer}>
        <Text>Valor:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Digite o valor"
          value={amount}
          onChangeText={text => setAmount(formatAmount(text))}
        />
      </View>
      <View style={styles.pickerContainer}>
        <Text>Moeda de Origem:</Text>
        <Picker
          selectedValue={baseCurrency}
          style={styles.picker}
          onValueChange={itemValue => setBaseCurrency(itemValue)}
        >
          {currencies.map(currency => (
            <Picker.Item
              key={currency}
              label={`${currency} - ${currencyNames[currency]}`}
              value={currency}
            />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text>Moeda de Destino:</Text>
        <Picker
          selectedValue={targetCurrency}
          style={styles.picker}
          onValueChange={itemValue => setTargetCurrency(itemValue)}
        >
          {currencies.map(currency => (
            <Picker.Item
              key={currency}
              label={`${currency} - ${currencyNames[currency]}`}
              value={currency}
            />
          ))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleInvertCurrencies}>
        <Text style={styles.buttonText}>Inverter Moedas</Text>
      </TouchableOpacity>
      {convertedAmount !== null && (
        <Text style={styles.result}>
          Valor convertido: {convertedAmount.toFixed(2)} {targetCurrency}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    fontSize: 18,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  result: {
    margin: 20,
    fontSize: 22, 
    textAlign: 'center'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

// Função para formatar data para API da Wikipedia
const formatDateForWikipedia = (date) => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
};

// Função para buscar dados da Wikipedia
const fetchWikipediaData = async (date) => {
  const formattedDate = formatDateForWikipedia(date);
  const [month, day] = formattedDate.split('/');
  
  try {
    // API da Wikipedia portuguesa para eventos do dia
    const response = await axios.get(
      `https://pt.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`,
      {
        headers: {
          'Api-User-Agent': 'CuriosidadesAniversario/1.0 (contato@exemplo.com)'
        }
      }
    );
    
    return {
      births: response.data.births || [],
      deaths: response.data.deaths || [],
      events: response.data.events || []
    };
  } catch (error) {
    console.error('Erro ao buscar dados da Wikipedia:', error);
    return { births: [], deaths: [], events: [] };
  }
};

// Componente para exibir pessoa
const PersonCard = ({ person, type }) => {
  const year = person.year;
  const name = person.text;
  const description = person.pages?.[0]?.extract || 'Sem descrição disponível';
  const thumbnail = person.pages?.[0]?.thumbnail?.source;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start space-x-4">
        {thumbnail && (
          <img 
            src={thumbnail} 
            alt={name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>
          <p className="text-sm text-blue-600 font-medium mb-2">
            {type === 'birth' ? 'Nasceu' : 'Morreu'} em {year}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            {description.length > 150 ? `${description.substring(0, 150)}...` : description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente principal
function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [wikipediaData, setWikipediaData] = useState({ births: [], deaths: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar dados quando a data muda
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWikipediaData(selectedDate);
        setWikipediaData(data);
      } catch (err) {
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatInputDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎂 Curiosidades do Aniversário
            </h1>
            <p className="text-lg text-gray-600">
              Descubra quem nasceu e morreu em {formatDisplayDate(selectedDate)}
            </p>
          </div>
        </div>
      </header>

      {/* Date Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <label htmlFor="date-picker" className="text-lg font-medium text-gray-700">
              Escolha uma data:
            </label>
            <input
              id="date-picker"
              type="date"
              value={formatInputDate(selectedDate)}
              onChange={handleDateChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-lg text-gray-600">Carregando curiosidades...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">⚠️</div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Nascimentos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
                🌟 Nascimentos ({wikipediaData.births.length})
              </h2>
              {wikipediaData.births.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {wikipediaData.births.slice(0, 10).map((person, index) => (
                    <PersonCard key={index} person={person} type="birth" />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum nascimento encontrado para esta data.
                </p>
              )}
            </div>

            {/* Mortes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center">
                🕊️ Mortes ({wikipediaData.deaths.length})
              </h2>
              {wikipediaData.deaths.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {wikipediaData.deaths.slice(0, 10).map((person, index) => (
                    <PersonCard key={index} person={person} type="death" />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma morte encontrada para esta data.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        {!loading && !error && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Dados fornecidos pela Wikipedia Portuguesa • 
              Mostrando até 10 resultados por categoria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
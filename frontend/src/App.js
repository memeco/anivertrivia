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
      events: response.data.events || [],
      holidays: response.data.holidays || [],
      selected: response.data.selected || []
    };
  } catch (error) {
    console.error('Erro ao buscar dados da Wikipedia:', error);
    return { births: [], deaths: [], events: [], holidays: [], selected: [] };
  }
};

// Componente para exibir pessoa
const PersonCard = ({ person, type }) => {
  const year = person.year;
  const name = person.text;
  const description = person.pages?.[0]?.extract || 'Sem descrição disponível';
  const thumbnail = person.pages?.[0]?.thumbnail?.source;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start space-x-3">
        {thumbnail && (
          <img 
            src={thumbnail} 
            alt={name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h4 className="text-base font-semibold text-gray-800 mb-1">{name}</h4>
          <p className="text-xs text-blue-600 font-medium mb-2">
            {type === 'birth' ? 'Nasceu' : 'Morreu'} em {year}
          </p>
          <p className="text-gray-600 text-xs leading-relaxed">
            {description.length > 120 ? `${description.substring(0, 120)}...` : description}
          </p>
        </div>
      </div>
    </div>
  );
};

// Componente para eventos históricos
const EventCard = ({ event }) => {
  const year = event.year;
  const description = event.text;
  const extract = event.pages?.[0]?.extract || '';
  const thumbnail = event.pages?.[0]?.thumbnail?.source;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start space-x-3">
        {thumbnail && (
          <img 
            src={thumbnail} 
            alt="Evento histórico"
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
              {year}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-800 mb-2">{description}</p>
          {extract && (
            <p className="text-gray-600 text-xs leading-relaxed">
              {extract.length > 100 ? `${extract.substring(0, 100)}...` : extract}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para feriados
const HolidayCard = ({ holiday }) => {
  const name = holiday.text;
  const description = holiday.pages?.[0]?.extract || '';
  const thumbnail = holiday.pages?.[0]?.thumbnail?.source;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-green-100">
      <div className="flex items-start space-x-3">
        {thumbnail && (
          <img 
            src={thumbnail} 
            alt={name}
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center">
            🎉 {name}
          </h4>
          {description && (
            <p className="text-green-700 text-xs leading-relaxed">
              {description.length > 120 ? `${description.substring(0, 120)}...` : description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para eventos selecionados
const SelectedEventCard = ({ event }) => {
  const year = event.year;
  const description = event.text;
  const extract = event.pages?.[0]?.extract || '';
  const thumbnail = event.pages?.[0]?.thumbnail?.source;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-amber-200">
      <div className="flex items-start space-x-3">
        {thumbnail && (
          <img 
            src={thumbnail} 
            alt="Evento destacado"
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded mr-2">
              {year}
            </span>
            <span className="text-xs text-amber-600 font-medium">✨ Destaque</span>
          </div>
          <p className="text-sm font-medium text-gray-800 mb-2">{description}</p>
          {extract && (
            <p className="text-gray-600 text-xs leading-relaxed">
              {extract.length > 120 ? `${extract.substring(0, 120)}...` : extract}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal
function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [wikipediaData, setWikipediaData] = useState({ 
    births: [], 
    deaths: [], 
    events: [], 
    holidays: [], 
    selected: [] 
  });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🎂 Curiosidades do Aniversário
            </h1>
            <p className="text-lg text-gray-600">
              Descubra tudo que aconteceu em {formatDisplayDate(selectedDate)}
            </p>
          </div>
        </div>
      </header>

      {/* Date Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">⚠️</div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="space-y-6">
            
            {/* Eventos Destacados */}
            {wikipediaData.selected.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-amber-700 mb-4 flex items-center">
                  ✨ Eventos Destacados ({wikipediaData.selected.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                  {wikipediaData.selected.slice(0, 8).map((event, index) => (
                    <SelectedEventCard key={index} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Feriados e Celebrações */}
            {wikipediaData.holidays.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                  🎉 Feriados e Celebrações ({wikipediaData.holidays.length})
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wikipediaData.holidays.map((holiday, index) => (
                    <HolidayCard key={index} holiday={holiday} />
                  ))}
                </div>
              </div>
            )}

            {/* Nascimentos e Mortes */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Nascimentos */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                  🌟 Nascimentos ({wikipediaData.births.length})
                </h2>
                {wikipediaData.births.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {wikipediaData.births.slice(0, 8).map((person, index) => (
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
                <h2 className="text-2xl font-bold text-red-700 mb-4 flex items-center">
                  🕊️ Mortes ({wikipediaData.deaths.length})
                </h2>
                {wikipediaData.deaths.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {wikipediaData.deaths.slice(0, 8).map((person, index) => (
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

            {/* Eventos Históricos */}
            {wikipediaData.events.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
                  📜 Eventos Históricos ({wikipediaData.events.length})
                </h2>
                <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {wikipediaData.events.slice(0, 12).map((event, index) => (
                    <EventCard key={index} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        {!loading && !error && (
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="bg-amber-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-amber-700">{wikipediaData.selected?.length || 0}</div>
                  <div className="text-xs text-amber-600">Destaques</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-700">{wikipediaData.holidays?.length || 0}</div>
                  <div className="text-xs text-green-600">Feriados</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-700">{wikipediaData.births?.length || 0}</div>
                  <div className="text-xs text-blue-600">Nascimentos</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-700">{wikipediaData.deaths?.length || 0}</div>
                  <div className="text-xs text-red-600">Mortes</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-700">{wikipediaData.events?.length || 0}</div>
                  <div className="text-xs text-purple-600">Eventos</div>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              Dados fornecidos pela Wikipedia Portuguesa • 
              Atualizado diariamente com as informações mais recentes
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
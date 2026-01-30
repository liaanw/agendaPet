import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

/* ================== Configurar calendário em Português BR ================== */
LocaleConfig.locales["br"] = {
  monthNames: [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ],
  monthNamesShort: [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ],
  dayNames: [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ],
  dayNamesShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "br";

/* ================== SERVIÇOS DISPONÍVEIS ================== */
const SERVICOS = ["Banho", "Tosa"];

/* ================== HORÁRIOS ================== */
const HORARIOS = Array.from({ length: 10 }, (_, i) => {
  const hora = 8 + i;
  return `${hora.toString().padStart(2, "0")}:00`;
});

/* ================== GERAR DATAS BLOQUEADAS ALEATÓRIAS ================== */
function gerarDatasBloqueadas() {
  const bloqueadas = {};
  const hoje = new Date();
  for (let i = 1; i <= 15; i++) {
    const dia = new Date();
    dia.setDate(hoje.getDate() + Math.floor(Math.random() * 15)); // datas próximas aleatórias
    const key = dia.toISOString().split("T")[0];
    bloqueadas[key] = { disabled: true, disableTouchEvent: true };
  }
  return bloqueadas;
}

/* ================== TELA AGENDAR ================== */
function AgendarScreen({ agenda, setAgenda }) {
  const [cliente, setCliente] = useState("");
  const [cachorro, setCachorro] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [horaSelecionada, setHoraSelecionada] = useState("");
  const [datasBloqueadas, setDatasBloqueadas] = useState({});

  useEffect(() => {
    const bloqueadas = gerarDatasBloqueadas();
    setDatasBloqueadas(bloqueadas);
  }, []);

  async function salvarAgenda(novaAgenda) {
    setAgenda(novaAgenda);
    await AsyncStorage.setItem("agendaBanhoTosa", JSON.stringify(novaAgenda));
  }

  function toggleServico(servico) {
    if (servicosSelecionados.includes(servico)) {
      setServicosSelecionados(
        servicosSelecionados.filter((s) => s !== servico),
      );
    } else {
      setServicosSelecionados([...servicosSelecionados, servico]);
    }
  }

  function agendar() {
    if (
      !cliente ||
      !cachorro ||
      servicosSelecionados.length === 0 ||
      !dataSelecionada ||
      !horaSelecionada
    )
      return;

    const novoAgendamento = {
      id: Date.now().toString(),
      cliente,
      cachorro,
      servicos: [...servicosSelecionados],
      data: dataSelecionada,
      hora: horaSelecionada,
    };

    salvarAgenda([...agenda, novoAgendamento]);

    setCliente("");
    setCachorro("");
    setServicosSelecionados([]);
    setDataSelecionada("");
    setHoraSelecionada("");
  }

  // Horários já ocupados na data selecionada
  const horariosOcupados = agenda
    .filter((a) => a.data === dataSelecionada)
    .map((a) => a.hora);

  // Horários aleatórios bloqueados (simulando indisponibilidade)
  const horariosBloqueadosAleatorios = HORARIOS.filter(
    () => Math.random() < 0.2,
  );

  // Horários finais desabilitados
  const horariosDesabilitados = new Set([
    ...horariosOcupados,
    ...horariosBloqueadosAleatorios,
  ]);

  // Não permitir datas no passado
  const hojeStr = new Date().toISOString().split("T")[0];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>🐾 Agendar Banho & Tosa</Text>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Nome do cliente"
            value={cliente}
            onChangeText={setCliente}
          />

          <TextInput
            style={styles.input}
            placeholder="Nome do cachorro"
            value={cachorro}
            onChangeText={setCachorro}
          />

          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Serviços</Text>
          <View style={{ flexDirection: "row", marginBottom: 10 }}>
            {SERVICOS.map((servico) => {
              const selecionado = servicosSelecionados.includes(servico);
              return (
                <TouchableOpacity
                  key={servico}
                  style={[
                    styles.botaoServico,
                    selecionado && styles.botaoServicoSelecionado,
                  ]}
                  onPress={() => toggleServico(servico)}
                >
                  <Text
                    style={{
                      color: selecionado ? "#fff" : "#000",
                      fontWeight: "bold",
                    }}
                  >
                    {selecionado ? `✅ ${servico}` : servico}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            Selecione a data
          </Text>
          <Calendar
            minDate={hojeStr}
            onDayPress={(day) => setDataSelecionada(day.dateString)}
            markedDates={{
              ...datasBloqueadas,
              ...(dataSelecionada
                ? {
                    [dataSelecionada]: {
                      selected: true,
                      selectedColor: "#28a745",
                    },
                  }
                : {}),
            }}
          />

          {dataSelecionada ? (
            <>
              <Text style={{ fontWeight: "bold", marginTop: 10 }}>
                Escolha o horário
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginVertical: 10,
                }}
              >
                {HORARIOS.map((hora) => {
                  const desabilitado = horariosDesabilitados.has(hora);
                  const selecionado = horaSelecionada === hora;
                  return (
                    <TouchableOpacity
                      key={hora}
                      disabled={desabilitado}
                      style={[
                        styles.botaoServico,
                        selecionado && styles.botaoServicoSelecionado,
                        desabilitado && {
                          backgroundColor: "#ccc",
                          borderColor: "#ccc",
                        },
                      ]}
                      onPress={() => setHoraSelecionada(hora)}
                    >
                      <Text style={{ color: selecionado ? "#fff" : "#000" }}>
                        {hora} {desabilitado ? "⛔" : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : null}

          <TouchableOpacity style={styles.botao} onPress={agendar}>
            <Text style={styles.botaoTexto}>Agendar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================== TELA AGENDADOS ================== */
function AgendadosScreen({ agenda, setAgenda }) {
  const listaAgenda = Array.isArray(agenda) ? agenda : [];

  async function remover(id) {
    const novaAgenda = listaAgenda.filter((item) => item.id !== id);
    setAgenda(novaAgenda);
    await AsyncStorage.setItem("agendaBanhoTosa", JSON.stringify(novaAgenda));
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.listaContainer}>
        <Text style={styles.titulo}>📅 Agendamentos</Text>

        <FlatList
          data={listaAgenda}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Nenhum agendamento encontrado
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text style={styles.itemTitulo}>
                  🐶 {item.cachorro} — {(item.servicos || []).join(" + ")}
                </Text>
                <Text>👤 Cliente: {item.cliente}</Text>
                <Text>
                  📅 {item.data} ⏰ {item.hora}
                </Text>
              </View>

              <TouchableOpacity onPress={() => remover(item.id)}>
                <Text style={styles.remover}>❌</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

/* ================== APP ================== */
export default function App() {
  const [agenda, setAgenda] = useState([]);

  useEffect(() => {
    carregarAgenda();
  }, []);

  async function carregarAgenda() {
    const dados = await AsyncStorage.getItem("agendaBanhoTosa");
    if (dados) setAgenda(JSON.parse(dados));
  }

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Agendar">
          {() => <AgendarScreen agenda={agenda} setAgenda={setAgenda} />}
        </Tab.Screen>

        <Tab.Screen name="Agendados">
          {() => <AgendadosScreen agenda={agenda} setAgenda={setAgenda} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

/* ================== ESTILOS ================== */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  listaContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  botaoServico: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 5,
    backgroundColor: "#fff",
  },
  botaoServicoSelecionado: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  botao: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  botaoTexto: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  itemTitulo: {
    fontWeight: "bold",
  },
  remover: {
    fontSize: 18,
  },
});

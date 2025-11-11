<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Scale
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useBetsStore } from '../stores/bets'
import { getSimulatedRunners } from '../composables/useOddsSimulation'
import { timerManager } from '../utils/timerManager'
import { eventManager } from '../utils/eventManager'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)
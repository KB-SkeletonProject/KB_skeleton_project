// src/stores/useDashboardStore.js
import { defineStore } from 'pinia'
import {computed, ref} from 'vue'
import axios from 'axios'

export const useDashboardStore = defineStore('dashboard', () => {
    const chartData = ref([])
    const categorySpending = ref([])
    const transactions = ref([])
    const loading = ref(true)
    //home.vue에 totalIncome에 해당
    const totalIncome = computed(() =>
        transactions.value
            .filter((tx) => tx.amount > 0)
            .reduce((sum, tx) => sum + tx.amount, 0)
    );
    //home.vue에 savingsRate에 해당하는 부분
    const savingsAmount = computed(() => {
        if (totalIncome.value === 0) return 0;
        return Math.round((balance.value / totalIncome.value) * 100);
    });
    //home.vue에 balance에 해당하는 부분
    const balance = computed(() => totalIncome.value - totalExpense.value);

    //home.vue에 totalExspense에 해당하는 부분
    const totalExpense = computed(() =>
        transactions.value
            .filter((tx) => tx.amount < 0)
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    );

    const fetchData = async () => {
        loading.value = true
        try {
            const response = await axios.get('http://localhost:3000/money')
            const moneyData = response.data
            const monthlyTotals = {}

            moneyData.forEach((entry) => {
                const month = entry.date.slice(0, 7)
                if (!monthlyTotals[month]) {
                    monthlyTotals[month] = { income: 0, expense: 0 }
                }
                if (entry.typeid === 1) {
                    monthlyTotals[month].income += entry.amount
                } else if (entry.typeid === 2) {
                    monthlyTotals[month].expense += entry.amount
                }
            })
            chartData.value = Object.entries(monthlyTotals).map(([month, data]) => ({
                month,
                income: data.income,
                expense: data.expense,
            }))

            const categoryTotals = {}
            moneyData.forEach((entry) => {
                if (entry.typeid === 2) {
                    const catId = entry.categoryid
                    if (!categoryTotals[catId]) {
                        categoryTotals[catId] = 0
                    }
                    categoryTotals[catId] += entry.amount
                }
            })

            const categoryRes = await axios.get('http://localhost:3000/category')
            const categoryMap = categoryRes.data.reduce((map, cat) => {
                map[cat.id] = cat.name
                return map
            }, {})

            categorySpending.value = Object.entries(categoryTotals).map(
                ([catId, amount]) => ({
                    category: categoryMap[catId] || '기타',
                    amount,
                })
            )

            const sorted = moneyData.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            )
            const recentTransactions = sorted.slice(0, 5).map((entry) => ({
                date: entry.date,
                category: categoryMap[entry.categoryid] || '기타',
                description: entry.payment,
                amount: entry.typeid === 1 ? entry.amount : -entry.amount,
            }))
            transactions.value = recentTransactions
        } catch (error) {
            console.error('데이터 로딩 실패:', error)
        } finally {
            loading.value = false
        }
    }

    return {
        chartData,
        categorySpending,
        transactions,
        loading,
        fetchData,
        savingsAmount,
        totalIncome,
        balance,
        totalExpense,


    }
})

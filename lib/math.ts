/**
 * Calcula os juros compostos para um investimento inicial, aportes mensais, taxa e período.
 * Retorna o montante total projetado.
 */
export const calculateCompoundInterest = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): number => {
  const monthlyRate = annualRate / 12;
  const months = years * 12;

  // Calculo considerando aplicações no fim de cada mês
  let total = principal * Math.pow(1 + monthlyRate, months);
  
  if (monthlyContribution > 0) {
    total += monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  }

  return total;
};

/**
 * Projetor de Dividendos.
 * Retorna dados detalhados ano a ano do patrimônio estimado e dividendos.
 */
export const projectDividends = (
  totalInvested: number,
  monthlyContribution: number,
  currentYield: number,
  yearsToProject: number
) => {
  const data = [];
  let currentPatrimony = totalInvested;
  
  // Assumimos 8% ao ano de valorização do patrimônio (conservador focado em dividendos)
  const annualAppreciation = 0.08;
  const monthlyAppreciation = annualAppreciation / 12;

  for (let year = 1; year <= yearsToProject; year++) {
    // Rendimento e Aportes mensais
    for (let month = 1; month <= 12; month++) {
      const yieldThisMonth = (currentYield / 12) * currentPatrimony;
      // Reinvestimento dos dividendos + aporte mensal + valorização base do ativo
      currentPatrimony += monthlyContribution + yieldThisMonth;
      currentPatrimony *= (1 + monthlyAppreciation);
    }
    
    // Total de dividendos que esse patrimônio rende por ano naquele ponto
    const currentAnnualDividend = currentPatrimony * currentYield;
    
    data.push({
      year,
      patrimony: currentPatrimony,
      annualDividends: currentAnnualDividend,
      monthlyIncome: currentAnnualDividend / 12
    });
  }

  return data;
};

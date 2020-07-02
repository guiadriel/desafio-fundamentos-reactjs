import React, { useState, useEffect } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';
import formatDate from '../../utils/formatDate';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: {
    title: string;
  };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface TransactionResponse {
  id: string;
  title: string;
  type: 'income' | 'outcome';
  value: string;
  created_at: Date;
  category: {
    title: string;
  };
}

interface TransactionRequest {
  balance: Balance;
  transactions: TransactionResponse[];
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get<TransactionRequest>('transactions');
      const {
        balance: balanceResponse,
        transactions: transactionResponse,
      } = response.data;

      setBalance({
        income: formatValue(Number(balanceResponse.income)),
        outcome: formatValue(Number(balanceResponse.outcome)),
        total: formatValue(Number(balanceResponse.total)),
      });

      const formattedTransactions = transactionResponse.map(
        ({
          id,
          title,
          value,
          type,
          category,
          created_at,
        }: TransactionResponse) => {
          return {
            id,
            title,
            value: Number(value),
            formattedValue: formatValue(Number(value)),
            formattedDate: formatDate(new Date(created_at)),
            type,
            category,
            created_at,
          };
        },
      );

      setTransactions(formattedTransactions);
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td className={transaction.type}>
                    {transaction.type === 'outcome' ? '- ' : null}
                    {transaction.formattedValue}
                  </td>
                  <td>{transaction.category.title}</td>
                  <td>{transaction.formattedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;

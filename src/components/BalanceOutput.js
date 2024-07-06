import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as utils from '../utils';
import { journal } from '../data';

class BalanceOutput extends Component {
  render() {
    if (!this.props.userInput.format) {
      return null;
    }

    return (
      <div className='output'>
        <p>
          Total Debit: {this.props.totalDebit} Total Credit: {this.props.totalCredit}
          <br />
          Balance from account {this.props.userInput.startAccount || '*'}
          {' '}
          to {this.props.userInput.endAccount || '*'}
          {' '}
          from period {utils.dateToString(this.props.userInput.startPeriod)}
          {' '}
          to {utils.dateToString(this.props.userInput.endPeriod)}
        </p>
        {this.props.userInput.format === 'CSV' ? (
          <pre>{utils.toCSV(this.props.balance)}</pre>
        ) : null}
        {this.props.userInput.format === 'HTML' ? (
          <table className="table">
            <thead>
              <tr>
                <th>ACCOUNT</th>
                <th>DESCRIPTION</th>
                <th>DEBIT</th>
                <th>CREDIT</th>
                <th>BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {this.props.balance.map((entry, i) => (
                <tr key={i}>
                  <th scope="row">{entry.ACCOUNT}</th>
                  <td>{entry.DESCRIPTION}</td>
                  <td>{entry.DEBIT}</td>
                  <td>{entry.CREDIT}</td>
                  <td>{entry.BALANCE}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    );
  }
}

BalanceOutput.propTypes = {
  balance: PropTypes.arrayOf(
    PropTypes.shape({
      ACCOUNT: PropTypes.number.isRequired,
      DESCRIPTION: PropTypes.string.isRequired,
      DEBIT: PropTypes.number.isRequired,
      CREDIT: PropTypes.number.isRequired,
      BALANCE: PropTypes.number.isRequired
    })
  ).isRequired,
  totalCredit: PropTypes.number.isRequired,
  totalDebit: PropTypes.number.isRequired,
  userInput: PropTypes.shape({
    startAccount: PropTypes.number,
    endAccount: PropTypes.number,
    startPeriod: PropTypes.date,
    endPeriod: PropTypes.date,
    format: PropTypes.string
  }).isRequired
};

export default connect(state => {
  let balance = [];


  /* YOUR CODE GOES HERE */
  const { accounts, journalEntries, userInput } = state;

  // Filter journal entries based on user input
  const filteredEntries = journalEntries.filter(entry => {
    const { newAccount, newDate } = entry;
    const { startAccount, endAccount, startPeriod, endPeriod } = userInput;

    // Check if the entry is within the user input range
    return (
      (!startAccount || newAccount >= startAccount) &&
      (!endAccount || newAccount <= endAccount) &&
      (!startPeriod || newDate >= startPeriod) &&
      (!endPeriod || newDate <= endPeriod)
    );
  });

  // Calculate balance for each account
  balance = accounts.map(account => {
    // Destructure account object
    const { ACCOUNT, DESCRIPTION } = account;

    // Find all the entries where the entry it's equal to account , the result is a set of all debit entries for the account
    const debitEntries = filteredEntries.filter(entry => entry.ACCOUNT === ACCOUNT && entry.DEBIT);

    // Find all the entries where the entry it's equal to account , the result is a set of all credit entries for the account
    const creditEntries = filteredEntries.filter(entry => entry.ACCOUNT === ACCOUNT && entry.CREDIT);

    // Sum all the debit entries for the account, it starts with 0 and adds the DEBIT value of each entry
    const totalDebit = debitEntries.reduce((acc, entry) => acc + entry.DEBIT, 0);

    // Sum all the credit entries for the account, it starts with 0 and adds the CREDIT value of each entry
    const totalCredit = creditEntries.reduce((acc, entry) => acc + entry.CREDIT, 0);
    const BALANCE = totalDebit - totalCredit;

    // Return the account object with the new values
    return {
      ACCOUNT,
      DESCRIPTION,
      DEBIT: totalDebit,
      CREDIT: totalCredit,
      BALANCE,
    };
  });

  // End code

  const totalCredit = balance.reduce((acc, entry) => acc + entry.CREDIT, 0);
  const totalDebit = balance.reduce((acc, entry) => acc + entry.DEBIT, 0);

  return {
    balance,
    totalCredit,
    totalDebit,
    userInput: state.userInput
  };
})(BalanceOutput);

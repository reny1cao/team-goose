class Card {
  constructor(word, role) {
    this.word = word;
    this.role = role;
    this.selected = false;
    this.voted = [];
  }

  select() {
    this.selected = true;
  }

  addVote(user) {
    this.voted.push(user);
  }

  getNumVotes() {
    return this.voted.length;
  }
  
  getStatus() {
    return this.selected;
  }
 }

module.exports = Card;

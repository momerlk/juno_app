class railwayForm {
  constructor(name, trainnum, firstclass) {
      this.name = name;
      this.trainnum = trainnum;
      this.firstclass = firstclass;
      console.log(name + ' has booked ' + (firstclass ? 'a first class' : 'an economy') + ' ticket on train number ' + trainnum);
  }
}

const details = (name, trainnum, firstclass, passengerid) =>{
  console.log('Enter your name, train number, passengerid and whether or not you booked a first class ticket')
  let containerpassengerid = {}
  containerpassengerid[passengerid] = new railwayForm(name, trainnum, firstclass)
  return containerpassengerid
}

details();
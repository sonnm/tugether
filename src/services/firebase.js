class FirebaseService {
  groupOrderId = null;

  setGroupOrderId = (groupOrderId) => {
    this.groupOrderId = groupOrderId;
  };

  hello = () => {
    console.log(this.groupOrderId);
  };
}

const service = new FirebaseService();
export default service;

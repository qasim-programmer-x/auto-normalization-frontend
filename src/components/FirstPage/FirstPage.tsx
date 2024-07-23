import "./FirstPage.scss";
export default function FirstPage() {
  return (
    <section className="first-page-main">
      <h1>Welcome to Auto Normalizer</h1>
      <p>
        Auto Normalizer leverages advanced AI to seamlessly normalize your heterogeneous datasets into the Third Normal Form (3NF), ensuring
        optimal data integrity and minimizing redundancy. Our intuitive interface and powerful backend make data normalization accessible to
        everyone, from novice users to experienced database administrators.
      </p>
      <h2>How It Works</h2>
      <h3>
        Step 1: <span>Upload your datasets in Excel format through our user-friendly interface.</span>
      </h3>
      <h3>
        Step 2: <span>Our AI algorithms analyze your data, identifying patterns and dependencies crucial for effective normalization.</span>
      </h3>
      <h3>
        Step 3:{" "}
        <span>
          The system automatically normalizes your data into the Third Normal Form (3NF), ensuring data integrity and reducing redundancy.
        </span>
      </h3>
      <h3>
        Step 4: <span>Receive SQL scripts for your normalized data, ready to be integrated into your database management system.</span>
      </h3>
    </section>
  );
}
